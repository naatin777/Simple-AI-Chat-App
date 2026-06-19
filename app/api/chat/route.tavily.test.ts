import { afterEach, beforeEach, vi } from "vitest";

import { setupTestDb } from "@/lib/db/vitest-mock";
import { seedConversation } from "@/lib/test/seed";

const prepareRagContext = vi.fn();
const streamText = vi.fn();
const getTavilyChatTools = vi.fn();

vi.mock("@/lib/rag/prepare-context", () => ({
  prepareRagContext,
}));

vi.mock("@/lib/tavily/tools", () => ({
  getTavilyChatTools,
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

const originalEnv = { ...process.env };

describe("POST /api/chat Tavily integration", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    prepareRagContext.mockReset();
    streamText.mockReset();
    getTavilyChatTools.mockReset();
    streamText.mockReturnValue({
      toUIMessageStreamResponse: () => new Response("ok"),
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("attaches Tavily tools when web search is enabled", async () => {
    process.env.TAVILY_API_KEY = "tvly-test";
    getTavilyChatTools.mockReturnValue({
      webSearch: { description: "mock" },
    });

    const { id: conversationId } = await seedConversation();
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          webSearch: true,
          messages: [
            {
              id: "msg-1",
              role: "user",
              parts: [{ type: "text", text: "Latest AI news?" }],
            },
          ],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(getTavilyChatTools).toHaveBeenCalled();
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: { webSearch: { description: "mock" } },
        stopWhen: expect.any(Function),
        system: expect.stringContaining("webSearch tool"),
      }),
    );
  });

  it("skips Tavily tools when web search is disabled", async () => {
    process.env.TAVILY_API_KEY = "tvly-test";
    getTavilyChatTools.mockReturnValue({
      webSearch: { description: "mock" },
    });

    const { id: conversationId } = await seedConversation();
    const { POST } = await import("./route");

    await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          webSearch: false,
          messages: [
            {
              id: "msg-1",
              role: "user",
              parts: [{ type: "text", text: "Hello" }],
            },
          ],
        }),
      }),
    );

    expect(getTavilyChatTools).not.toHaveBeenCalled();
    expect(streamText).toHaveBeenCalledWith(
      expect.not.objectContaining({
        tools: expect.anything(),
      }),
    );
  });
});
