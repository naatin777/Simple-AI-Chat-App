import { getDirectoryCheckedState } from "./index";
import { nestedI18nItems, rootPathA } from "./test-fixtures";

describe("getDirectoryCheckedState", () => {
  const resourcesDir = nestedI18nItems[1];

  it("returns false when no files are checked", () => {
    expect(
      getDirectoryCheckedState(nestedI18nItems, resourcesDir, new Set()),
    ).toBe(false);
  });

  it("returns true when all registered descendants are checked", () => {
    expect(
      getDirectoryCheckedState(
        nestedI18nItems,
        resourcesDir,
        new Set([
          "file:dir-1:resources/en.json",
          "file:dir-1:resources/ja.json",
        ]),
      ),
    ).toBe(true);
  });

  it("returns indeterminate for partial selection", () => {
    expect(
      getDirectoryCheckedState(
        nestedI18nItems,
        resourcesDir,
        new Set(["file:dir-1:resources/en.json"]),
      ),
    ).toBe("indeterminate");
  });

  it("returns indeterminate when siblings are checked but folder children are not registered", () => {
    const collapsedDir = {
      directoryId: "dir-1",
      directoryName: "i18n",
      rootPath: rootPathA,
      relativePath: "unexpanded",
      name: "unexpanded",
      type: "directory" as const,
    };

    expect(
      getDirectoryCheckedState(
        nestedI18nItems,
        collapsedDir,
        new Set(["file:dir-1:unexpanded/hidden.ts"]),
      ),
    ).toBe("indeterminate");
  });

  it("returns true for i18n root when all registered files under it are checked", () => {
    const i18nRoot = nestedI18nItems[0];

    expect(
      getDirectoryCheckedState(
        nestedI18nItems,
        i18nRoot,
        new Set([
          "file:dir-1:resources/en.json",
          "file:dir-1:resources/ja.json",
          "file:dir-1:client.ts",
          "file:dir-1:index.ts",
        ]),
      ),
    ).toBe(true);
  });
});
