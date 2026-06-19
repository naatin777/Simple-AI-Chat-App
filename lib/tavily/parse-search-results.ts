import type { WebSearchSource } from "@/lib/tavily/types";

type TavilySearchResult = {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
};

export function parseTavilySearchOutput(output: unknown): WebSearchSource[] {
  if (typeof output !== "object" || output === null || !("results" in output)) {
    return [];
  }

  const { results } = output as { results?: unknown };

  if (!Array.isArray(results)) {
    return [];
  }

  return results
    .map((result, index): WebSearchSource | null => {
      if (typeof result !== "object" || result === null) {
        return null;
      }

      const entry = result as TavilySearchResult;
      const url = entry.url?.trim();
      const title = entry.title?.trim();

      if (!url || !title) {
        return null;
      }

      return {
        id: index + 1,
        title,
        url,
        excerpt: entry.content?.trim() || undefined,
        score: typeof entry.score === "number" ? entry.score : undefined,
      };
    })
    .filter((source): source is WebSearchSource => source !== null);
}
