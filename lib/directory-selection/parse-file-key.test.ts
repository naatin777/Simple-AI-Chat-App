import { parseFileKey } from "@/lib/directory-selection/parse-file-key";

describe("parseFileKey", () => {
  it("parses a file key into directory id and relative path", () => {
    expect(parseFileKey("file:dir-1:src/index.ts")).toEqual({
      directoryId: "dir-1",
      relativePath: "src/index.ts",
    });
  });

  it("returns null for directory keys", () => {
    expect(parseFileKey("dir:dir-1:src")).toBeNull();
  });

  it("returns null for malformed keys", () => {
    expect(parseFileKey("file:dir-1")).toBeNull();
    expect(parseFileKey("file::index.ts")).toBeNull();
  });
});
