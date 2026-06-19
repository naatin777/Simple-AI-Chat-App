import { parseFileKey } from "@/lib/directory-selection/parse-file-key";
import { MAX_CONTEXT_CHARS } from "@/lib/rag/config";
import type { RetrievedChunk } from "@/lib/rag/retrieve";
import type { RagPrepareResult, RagSource } from "@/lib/rag/types";

const EXCERPT_MAX_CHARS = 120;

export function buildRagContext(
  chunks: RetrievedChunk[],
  maxChars = MAX_CONTEXT_CHARS,
): RagPrepareResult {
  let context = "";
  const sources: RagSource[] = [];

  for (const chunk of chunks) {
    const sourceId = sources.length + 1;
    const header = `[${sourceId}] path: ${chunk.relativePath} (chunk ${chunk.chunkIndex + 1}/${chunk.chunkTotal})`;
    const section = `--- ${header} ---\n${chunk.content}\n\n`;

    if (context.length + section.length > maxChars) {
      break;
    }

    context += section;

    const parsed = parseFileKey(chunk.fileKey);

    sources.push({
      id: sourceId,
      fileKey: chunk.fileKey,
      directoryId: parsed?.directoryId ?? "",
      relativePath: chunk.relativePath,
      chunkIndex: chunk.chunkIndex,
      chunkTotal: chunk.chunkTotal,
      score: chunk.score,
      excerpt: chunk.content.slice(0, EXCERPT_MAX_CHARS),
    });
  }

  return {
    context: context.trim(),
    sources,
  };
}
