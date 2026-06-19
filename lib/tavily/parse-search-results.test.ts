import { describe, expect, it } from "vitest";

import { parseTavilySearchOutput } from "@/lib/tavily/parse-search-results";

describe("parseTavilySearchOutput", () => {
  it("returns parsed web sources from Tavily output", () => {
    expect(
      parseTavilySearchOutput({
        query: "latest ai news",
        results: [
          {
            title: "Example News",
            url: "https://example.com/news",
            content: "Snippet text",
            score: 0.91,
          },
        ],
      }),
    ).toEqual([
      {
        id: 1,
        title: "Example News",
        url: "https://example.com/news",
        excerpt: "Snippet text",
        score: 0.91,
      },
    ]);
  });

  it("skips invalid entries", () => {
    expect(
      parseTavilySearchOutput({
        results: [{ title: "No URL" }, { url: "https://example.com" }],
      }),
    ).toEqual([]);
  });
});
