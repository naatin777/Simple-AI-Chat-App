export type AiProviderName = "openrouter" | "google";

export function getAiProvider(): AiProviderName {
  const raw = (process.env.AI_PROVIDER ?? "openrouter").toLowerCase();

  if (raw === "google" || raw === "gemini") {
    return "google";
  }

  return "openrouter";
}

export function getChatModelId(): string {
  if (getAiProvider() === "google") {
    return process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  }

  return process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";
}

export function getEmbeddingModelId(): string {
  if (getAiProvider() === "google") {
    return process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";
  }

  return (
    process.env.OPENROUTER_EMBEDDING_MODEL ?? "openai/text-embedding-3-small"
  );
}
