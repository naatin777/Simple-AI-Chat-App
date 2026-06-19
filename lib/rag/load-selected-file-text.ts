import { eq } from "drizzle-orm";

import { parseFileKey } from "@/lib/directory-selection/parse-file-key";
import { db } from "@/lib/db";
import { conversationDirectories } from "@/lib/db/schema";
import {
  extractTextFromConversationFile,
  readConversationFile,
} from "@/lib/fs/read-conversation-file";

export interface SelectedFileText {
  fileKey: string;
  relativePath: string;
  text: string;
}

export async function loadSelectedFileTexts(params: {
  conversationId: string;
  checkedFileKeys: string[];
}): Promise<SelectedFileText[]> {
  const uniqueFileKeys = [...new Set(params.checkedFileKeys)];

  if (uniqueFileKeys.length === 0) {
    return [];
  }

  const directories = await db
    .select()
    .from(conversationDirectories)
    .where(eq(conversationDirectories.conversationId, params.conversationId));

  const directoryById = new Map(
    directories.map((directory) => [directory.id, directory]),
  );

  const results: SelectedFileText[] = [];

  for (const fileKey of uniqueFileKeys) {
    const parsed = parseFileKey(fileKey);

    if (!parsed) {
      continue;
    }

    const directory = directoryById.get(parsed.directoryId);

    if (!directory) {
      continue;
    }

    try {
      const file = await readConversationFile(directory.path, parsed.relativePath);
      const text = await extractTextFromConversationFile(file);

      if (!text?.trim()) {
        continue;
      }

      results.push({
        fileKey,
        relativePath: parsed.relativePath,
        text: text.trim(),
      });
    } catch (error) {
      console.error("[rag] Failed to read selected file", {
        conversationId: params.conversationId,
        fileKey,
        error,
      });
    }
  }

  return results;
}
