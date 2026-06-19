import { chunkText } from "@/lib/rag/chunk-text";

describe("chunkText", () => {
  it("returns an empty array for blank text", () => {
    expect(chunkText("   ")).toEqual([]);
  });

  it("returns a single chunk when text is shorter than the chunk size", () => {
    expect(chunkText("hello world", 20, 5)).toEqual(["hello world"]);
  });

  it("splits long text with overlap", () => {
    const text = "abcdefghijklmnopqrstuvwxyz";
    const chunks = chunkText(text, 10, 3);

    expect(chunks).toEqual([
      "abcdefghij",
      "hijklmnopq",
      "opqrstuvwx",
      "vwxyz",
    ]);
  });
});
