import { eq } from "drizzle-orm";

import { parseFileKey } from "@/lib/directory-selection/parse-file-key";
import { db } from "@/lib/db";
import { conversationDirectories } from "@/lib/db/schema";
import { buildRagContext } from "@/lib/rag/build-context";
import { RAG_USE_EMBEDDINGS } from "@/lib/rag/config";
import { ensureFileIndexed } from "@/lib/rag/index-document";
import { prepareStuffContext } from "@/lib/rag/prepare-stuff-context";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import type { RagPrepareResult } from "@/lib/rag/types";

function isEmbeddingQuotaError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Key limit exceeded") ||
    error.message.includes("insufficient_quota") ||
    error.message.includes("rate limit")
  );
}

async function prepareEmbeddingContext(params: {
  conversationId: string;
  checkedFileKeys: string[];
  query: string;
}): Promise<RagPrepareResult | null> {
  const uniqueFileKeys = [...new Set(params.checkedFileKeys)];

  const directories = await db
    .select()
    .from(conversationDirectories)
    .where(eq(conversationDirectories.conversationId, params.conversationId));

  const directoryById = new Map(
    directories.map((directory) => [directory.id, directory]),
  );

  let embeddingFailed = false;

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
      await ensureFileIndexed({
        conversationId: params.conversationId,
        fileKey,
        directoryRootPath: directory.path,
        relativePath: parsed.relativePath,
      });
    } catch (error) {
      embeddingFailed = true;
      console.error("[rag] Failed to index file", {
        conversationId: params.conversationId,
        fileKey,
        error,
      });

      if (isEmbeddingQuotaError(error)) {
        console.warn(
          "[rag] Embedding quota exceeded; falling back to direct file context",
        );
      }
    }
  }

  try {
    const chunks = await retrieveRelevantChunks({
      conversationId: params.conversationId,
      checkedFileKeys: uniqueFileKeys,
      query: params.query,
    });

    if (chunks.length > 0) {
      return buildRagContext(chunks);
    }
  } catch (error) {
    embeddingFailed = true;
    console.error("[rag] Failed to retrieve chunks", {
      conversationId: params.conversationId,
      error,
    });

    if (isEmbeddingQuotaError(error)) {
      console.warn(
        "[rag] Embedding quota exceeded; falling back to direct file context",
      );
    }
  }

  if (embeddingFailed) {
    return prepareStuffContext({
      conversationId: params.conversationId,
      checkedFileKeys: uniqueFileKeys,
    });
  }

  return null;
}

export async function prepareRagContext(params: {
  conversationId: string;
  checkedFileKeys: string[];
  query: string;
}): Promise<RagPrepareResult | null> {
  const uniqueFileKeys = [...new Set(params.checkedFileKeys)];

  if (uniqueFileKeys.length === 0 || !params.query.trim()) {
    return null;
  }

  if (!RAG_USE_EMBEDDINGS) {
    return prepareStuffContext({
      conversationId: params.conversationId,
      checkedFileKeys: uniqueFileKeys,
    });
  }

  const embeddingContext = await prepareEmbeddingContext(params);

  if (embeddingContext) {
    return embeddingContext;
  }

  return prepareStuffContext({
    conversationId: params.conversationId,
    checkedFileKeys: uniqueFileKeys,
  });
}
