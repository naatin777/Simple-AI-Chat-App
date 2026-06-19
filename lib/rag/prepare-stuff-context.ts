import { buildRagContext } from "@/lib/rag/build-context";
import { chunkText } from "@/lib/rag/chunk-text";
import { loadSelectedFileTexts } from "@/lib/rag/load-selected-file-text";
import type { RetrievedChunk } from "@/lib/rag/retrieve";
import type { RagPrepareResult } from "@/lib/rag/types";

export async function prepareStuffContext(params: {
  conversationId: string;
  checkedFileKeys: string[];
}): Promise<RagPrepareResult | null> {
  const files = await loadSelectedFileTexts(params);

  if (files.length === 0) {
    return null;
  }

  const chunks: RetrievedChunk[] = [];

  for (const file of files) {
    const textChunks = chunkText(file.text);

    for (const [chunkIndex, content] of textChunks.entries()) {
      chunks.push({
        fileKey: file.fileKey,
        relativePath: file.relativePath,
        content,
        score: 1,
        chunkIndex,
        chunkTotal: textChunks.length,
      });
    }
  }

  if (chunks.length === 0) {
    return null;
  }

  return buildRagContext(chunks);
}
