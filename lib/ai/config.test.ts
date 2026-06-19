import { afterEach, describe, expect, it } from "vitest";

import {
  getAiProvider,
  getChatModelId,
  getEmbeddingModelId,
} from "@/lib/ai/config";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("getAiProvider", () => {
  it("defaults to openrouter", () => {
    delete process.env.AI_PROVIDER;
    expect(getAiProvider()).toBe("openrouter");
  });

  it("accepts google and gemini aliases", () => {
    process.env.AI_PROVIDER = "google";
    expect(getAiProvider()).toBe("google");

    process.env.AI_PROVIDER = "gemini";
    expect(getAiProvider()).toBe("google");
  });
});

describe("model ids", () => {
  it("uses OpenRouter env vars when provider is openrouter", () => {
    process.env.AI_PROVIDER = "openrouter";
    process.env.OPENROUTER_MODEL = "openai/gpt-oss-120b:free";
    process.env.OPENROUTER_EMBEDDING_MODEL = "openai/text-embedding-3-small";

    expect(getChatModelId()).toBe("openai/gpt-oss-120b:free");
    expect(getEmbeddingModelId()).toBe("openai/text-embedding-3-small");
  });

  it("uses Gemini env vars when provider is google", () => {
    process.env.AI_PROVIDER = "google";
    process.env.GEMINI_MODEL = "gemini-2.5-flash";
    process.env.GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";

    expect(getChatModelId()).toBe("gemini-2.5-flash");
    expect(getEmbeddingModelId()).toBe("gemini-embedding-001");
  });
});
