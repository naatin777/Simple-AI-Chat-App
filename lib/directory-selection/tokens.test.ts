import {
  hasSelectionTokens,
  parseSelectionTokens,
  selectionTokensEqual,
} from "./index";

describe("parseSelectionTokens", () => {
  it("parses multiple @ includes", () => {
    expect(parseSelectionTokens("@a @b")).toEqual({
      includes: ["a", "b"],
      excludes: [],
      selectAll: false,
    });
  });

  it("parses multiple # excludes", () => {
    expect(parseSelectionTokens("#x #y")).toEqual({
      includes: [],
      excludes: ["x", "y"],
      selectAll: false,
    });
  });

  it("detects /all with surrounding text", () => {
    expect(parseSelectionTokens("use /all files")).toEqual({
      includes: [],
      excludes: [],
      selectAll: true,
    });
  });

  it("does not treat /allow as /all", () => {
    expect(parseSelectionTokens("/allow")).toEqual({
      includes: [],
      excludes: [],
      selectAll: false,
    });
  });
});

describe("hasSelectionTokens", () => {
  it("returns true when includes exist", () => {
    expect(hasSelectionTokens(parseSelectionTokens("@i18n"))).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(hasSelectionTokens(parseSelectionTokens("hello"))).toBe(false);
  });
});

describe("selectionTokensEqual", () => {
  it("ignores non-token text changes", () => {
    const left = parseSelectionTokens("hello @i18n");
    const right = parseSelectionTokens("world @i18n");

    expect(selectionTokensEqual(left, right)).toBe(true);
  });

  it("detects token changes", () => {
    const left = parseSelectionTokens("@i18n/a");
    const right = parseSelectionTokens("@i18n/b");

    expect(selectionTokensEqual(left, right)).toBe(false);
  });
});
