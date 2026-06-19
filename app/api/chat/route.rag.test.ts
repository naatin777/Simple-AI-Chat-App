import { vi } from "vitest";

import { setupTestDb } from "@/lib/db/vitest-mock";
import { seedConversation } from "@/lib/test/seed";

const prepareRagContext = vi.fn();
const streamText = vi.fn();

vi.mock("@/lib/rag/prepare-context", () => ({
  prepareRagContext,
}));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    streamText,
    convertToModelMessages: vi.fn().mockResolvedValue([]),
  };
});

setupTestDb();

describe("POST /api/chat RAG integration", () => {
  beforeEach(() => {
    prepareRagContext.mockReset();
    streamText.mockReset();
    streamText.mockReturnValue({
      toUIMessageStreamResponse: () => new Response("ok"),
    });
  });

  it("injects retrieved context into the system prompt", async () => {
    const { id: conversationId } = await seedConversation();
    prepareRagContext.mockResolvedValue({
      context: "--- [1] path: a.ts (chunk 1/1) ---\nalpha",
      sources: [
        {
          id: 1,
          fileKey: "file:dir-1:a.ts",
          directoryId: "dir-1",
          relativePath: "a.ts",
          chunkIndex: 0,
          chunkTotal: 1,
          score: 0.9,
          excerpt: "alpha",
        },
      ],
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          checkedFileKeys: ["file:dir-1:a.ts"],
          messages: [
            {
              id: "msg-1",
              role: "user",
              parts: [{ type: "text", text: "What is in a.ts?" }],
            },
          ],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(prepareRagContext).toHaveBeenCalledWith({
      conversationId,
      checkedFileKeys: ["file:dir-1:a.ts"],
      query: "What is in a.ts?",
    });
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining("--- [1] path: a.ts (chunk 1/1) ---"),
      }),
    );
  });
});
