import { buildRagContext } from "@/lib/rag/build-context";
import type { RetrievedChunk } from "@/lib/rag/retrieve";

const chunks: RetrievedChunk[] = [
  {
    fileKey: "file:dir-1:a.ts",
    relativePath: "a.ts",
    content: "alpha",
    score: 0.9,
    chunkIndex: 0,
    chunkTotal: 2,
  },
  {
    fileKey: "file:dir-1:b.ts",
    relativePath: "b.ts",
    content: "beta",
    score: 0.8,
    chunkIndex: 1,
    chunkTotal: 3,
  },
];

describe("buildRagContext", () => {
  it("formats retrieved chunks with numbered labels and source metadata", () => {
    const result = buildRagContext(chunks);

    expect(result.context).toBe(
      "--- [1] path: a.ts (chunk 1/2) ---\nalpha\n\n--- [2] path: b.ts (chunk 2/3) ---\nbeta",
    );
    expect(result.sources).toEqual([
      expect.objectContaining({
        id: 1,
        fileKey: "file:dir-1:a.ts",
        directoryId: "dir-1",
        relativePath: "a.ts",
        chunkIndex: 0,
        chunkTotal: 2,
        score: 0.9,
        excerpt: "alpha",
      }),
      expect.objectContaining({
        id: 2,
        relativePath: "b.ts",
        chunkIndex: 1,
        chunkTotal: 3,
      }),
    ]);
  });

  it("stops adding chunks when the max character limit is reached", () => {
    const result = buildRagContext(chunks, 45);

    expect(result.context).toBe("--- [1] path: a.ts (chunk 1/2) ---\nalpha");
    expect(result.sources).toHaveLength(1);
  });
});
