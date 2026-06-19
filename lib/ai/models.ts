import type { EmbeddingModelV3, LanguageModelV3 } from "@ai-sdk/provider";

import {
  getAiProvider,
  getChatModelId,
  getEmbeddingModelId,
} from "@/lib/ai/config";
import { google } from "@/lib/ai/google";
import { openrouter } from "@/lib/ai/openrouter";

export { getAiProvider } from "@/lib/ai/config";

export function getChatModel(): LanguageModelV3 {
  const modelId = getChatModelId();

  if (getAiProvider() === "google") {
    return google.chat(modelId);
  }

  return openrouter.chat(modelId);
}

export function getEmbeddingModel(): EmbeddingModelV3 {
  const modelId = getEmbeddingModelId();

  if (getAiProvider() === "google") {
    return google.embedding(modelId);
  }

  return openrouter.textEmbeddingModel(modelId);
}
