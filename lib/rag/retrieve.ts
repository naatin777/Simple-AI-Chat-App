import { cosineSimilarity, embed } from "ai";
import { and, eq, inArray } from "drizzle-orm";

import { getEmbeddingModel } from "@/lib/ai/models";
import { db } from "@/lib/db";
import { ragChunks, ragDocuments } from "@/lib/db/schema";
import { TOP_K } from "@/lib/rag/config";

function parseEmbedding(value: string): number[] {
  const parsed: unknown = JSON.parse(value);

  if (
    !Array.isArray(parsed) ||
    !parsed.every((item) => typeof item === "number")
  ) {
    throw new Error("Invalid embedding payload");
  }

  return parsed;
}

export interface RetrievedChunk {
  fileKey: string;
  relativePath: string;
  content: string;
  score: number;
  chunkIndex: number;
  chunkTotal: number;
}

export async function retrieveRelevantChunks(params: {
  conversationId: string;
  checkedFileKeys: string[];
  query: string;
}): Promise<RetrievedChunk[]> {
  const uniqueFileKeys = [...new Set(params.checkedFileKeys)];

  if (uniqueFileKeys.length === 0 || !params.query.trim()) {
    return [];
  }

  const documents = await db
    .select()
    .from(ragDocuments)
    .where(
      and(
        eq(ragDocuments.conversationId, params.conversationId),
        inArray(ragDocuments.fileKey, uniqueFileKeys),
      ),
    );

  if (documents.length === 0) {
    return [];
  }

  const documentIds = documents.map((document) => document.id);
  const documentById = new Map(documents.map((document) => [document.id, document]));

  const chunks = await db
    .select()
    .from(ragChunks)
    .where(inArray(ragChunks.documentId, documentIds));

  if (chunks.length === 0) {
    return [];
  }

  const chunkTotalByDocument = new Map<string, number>();

  for (const chunk of chunks) {
    chunkTotalByDocument.set(
      chunk.documentId,
      (chunkTotalByDocument.get(chunk.documentId) ?? 0) + 1,
    );
  }

  const { embedding: queryEmbedding } = await embed({
    model: getEmbeddingModel(),
    value: params.query,
  });

  const scoredChunks = chunks
    .map((chunk) => {
      const document = documentById.get(chunk.documentId);

      if (!document) {
        return null;
      }

      const chunkEmbedding = parseEmbedding(chunk.embedding);

      return {
        fileKey: document.fileKey,
        relativePath: document.relativePath,
        content: chunk.content,
        score: cosineSimilarity(queryEmbedding, chunkEmbedding),
        chunkIndex: chunk.chunkIndex,
        chunkTotal: chunkTotalByDocument.get(chunk.documentId) ?? 1,
      };
    })
    .filter((chunk): chunk is RetrievedChunk => chunk !== null)
    .sort((left, right) => right.score - left.score)
    .slice(0, TOP_K);

  return scoredChunks;
}
