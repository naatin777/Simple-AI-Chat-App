import type { RagSource } from "@/lib/rag/types";

export interface ChatMessageMetadata {
  ragSources?: RagSource[];
}

export function getRagSources(
  metadata: unknown,
): RagSource[] | undefined {
  if (
    typeof metadata !== "object" ||
    metadata === null ||
    !("ragSources" in metadata)
  ) {
    return undefined;
  }

  const { ragSources } = metadata as ChatMessageMetadata;

  if (!Array.isArray(ragSources) || ragSources.length === 0) {
    return undefined;
  }

  return ragSources;
}
