import { afterEach, describe, expect, it } from "vitest";

import { isTavilyEnabled } from "@/lib/tavily/config";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("isTavilyEnabled", () => {
  it("is false when TAVILY_API_KEY is missing", () => {
    delete process.env.TAVILY_API_KEY;
    expect(isTavilyEnabled()).toBe(false);
  });

  it("is true when TAVILY_API_KEY is set", () => {
    process.env.TAVILY_API_KEY = "tvly-test";
    expect(isTavilyEnabled()).toBe(true);
  });
});
