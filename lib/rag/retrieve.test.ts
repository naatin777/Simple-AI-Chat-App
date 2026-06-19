import { vi } from "vitest";

import { setupTestDb } from "@/lib/db/vitest-mock";
import { ragChunks, ragDocuments } from "@/lib/db/schema";
import { getTestDb } from "@/lib/db/vitest-mock";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import { seedConversation } from "@/lib/test/seed";

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    embed: vi.fn().mockResolvedValue({ embedding: [1, 0, 0] }),
  };
});

setupTestDb();

describe("retrieveRelevantChunks", () => {
  it("returns the highest scoring chunks for the selected files", async () => {
    const { id: conversationId } = await seedConversation();
    const { db } = getTestDb();
    const documentId = crypto.randomUUID();

    await db.insert(ragDocuments).values({
      id: documentId,
      conversationId,
      fileKey: "file:dir-1:a.ts",
      relativePath: "a.ts",
      contentHash: "hash-a",
      updatedAt: new Date(),
    });

    await db.insert(ragChunks).values([
      {
        id: crypto.randomUUID(),
        documentId,
        chunkIndex: 0,
        content: "alpha",
        embedding: JSON.stringify([1, 0, 0]),
      },
      {
        id: crypto.randomUUID(),
        documentId,
        chunkIndex: 1,
        content: "beta",
        embedding: JSON.stringify([0, 1, 0]),
      },
    ]);

    const chunks = await retrieveRelevantChunks({
      conversationId,
      checkedFileKeys: ["file:dir-1:a.ts"],
      query: "alpha",
    });

    expect(chunks).toHaveLength(2);
    expect(chunks[0]?.content).toBe("alpha");
    expect(chunks[0]?.score).toBeGreaterThan(chunks[1]?.score ?? 0);
  });

  it("returns an empty array when no indexed documents match", async () => {
    const { id: conversationId } = await seedConversation();

    const chunks = await retrieveRelevantChunks({
      conversationId,
      checkedFileKeys: ["file:dir-1:missing.ts"],
      query: "alpha",
    });

    expect(chunks).toEqual([]);
  });
});
