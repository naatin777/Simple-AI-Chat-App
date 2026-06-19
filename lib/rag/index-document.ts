import { embedMany } from "ai";
import { and, eq } from "drizzle-orm";

import { getEmbeddingModel } from "@/lib/ai/models";
import { db } from "@/lib/db";
import { ragChunks, ragDocuments } from "@/lib/db/schema";
import {
  extractTextFromConversationFile,
  readConversationFile,
} from "@/lib/fs/read-conversation-file";
import { chunkText } from "@/lib/rag/chunk-text";

export async function ensureFileIndexed(params: {
  conversationId: string;
  fileKey: string;
  directoryRootPath: string;
  relativePath: string;
}): Promise<void> {
  const file = await readConversationFile(
    params.directoryRootPath,
    params.relativePath,
  );
  const text = await extractTextFromConversationFile(file);

  if (!text?.trim()) {
    return;
  }

  const existingRows = await db
    .select()
    .from(ragDocuments)
    .where(
      and(
        eq(ragDocuments.conversationId, params.conversationId),
        eq(ragDocuments.fileKey, params.fileKey),
      ),
    );

  const existing = existingRows.at(0);

  if (existing?.contentHash === file.contentHash) {
    return;
  }

  if (existing) {
    await db.delete(ragDocuments).where(eq(ragDocuments.id, existing.id));
  }

  const chunks = chunkText(text);

  if (chunks.length === 0) {
    return;
  }

  const { embeddings } = await embedMany({
    model: getEmbeddingModel(),
    values: chunks,
  });

  const documentId = crypto.randomUUID();

  await db.insert(ragDocuments).values({
    id: documentId,
    conversationId: params.conversationId,
    fileKey: params.fileKey,
    relativePath: params.relativePath,
    contentHash: file.contentHash,
    updatedAt: new Date(),
  });

  await db.insert(ragChunks).values(
    chunks.map((content, chunkIndex) => ({
      id: crypto.randomUUID(),
      documentId,
      chunkIndex,
      content,
      embedding: JSON.stringify(embeddings[chunkIndex]),
    })),
  );
}
