import { tavilySearch } from "@tavily/ai-sdk";

import { isTavilyEnabled } from "@/lib/tavily/config";

export function getTavilyChatTools() {
  if (!isTavilyEnabled()) {
    return undefined;
  }

  return {
    webSearch: tavilySearch({
      searchDepth: "advanced",
      maxResults: 5,
      includeAnswer: true,
    }),
  };
}
