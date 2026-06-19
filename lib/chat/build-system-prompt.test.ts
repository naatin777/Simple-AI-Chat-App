import { buildSystemPrompt } from "@/lib/chat/build-system-prompt";

describe("buildSystemPrompt", () => {
  it("returns the base prompt when no RAG context is provided", () => {
    expect(buildSystemPrompt(null)).toBe("You are a helpful assistant.");
  });

  it("includes the RAG context block when provided", () => {
    const prompt = buildSystemPrompt("--- path: a.ts ---\nalpha");

    expect(prompt).toContain("<context>");
    expect(prompt).toContain("--- path: a.ts ---");
    expect(prompt).toContain("alpha");
  });

  it("includes web search instructions when enabled", () => {
    const prompt = buildSystemPrompt({ webSearchEnabled: true });

    expect(prompt).toContain("webSearch tool");
    expect(prompt).toContain("Cite URLs");
  });
});
