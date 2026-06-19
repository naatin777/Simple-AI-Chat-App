import {
  computeCheckedFileKeys,
  getDirectoryCheckedState,
  parseFileReferences,
  parseSelectionTokens,
  type DirectorySelectionItem,
} from "./index";

const rootPathA = "/Users/dev/project-a/i18n";
const rootPathB = "/Users/dev/project-b/lib";

const items: DirectorySelectionItem[] = [
  {
    directoryId: "dir-1",
    directoryName: "i18n",
    rootPath: rootPathA,
    relativePath: "",
    name: "i18n",
    type: "directory",
  },
  {
    directoryId: "dir-1",
    directoryName: "i18n",
    rootPath: rootPathA,
    relativePath: "resources",
    name: "resources",
    type: "directory",
  },
  {
    directoryId: "dir-1",
    directoryName: "i18n",
    rootPath: rootPathA,
    relativePath: "resources/en.json",
    name: "en.json",
    type: "file",
  },
  {
    directoryId: "dir-1",
    directoryName: "i18n",
    rootPath: rootPathA,
    relativePath: "resources/ja.json",
    name: "ja.json",
    type: "file",
  },
  {
    directoryId: "dir-1",
    directoryName: "i18n",
    rootPath: rootPathA,
    relativePath: "client.ts",
    name: "client.ts",
    type: "file",
  },
  {
    directoryId: "dir-2",
    directoryName: "lib",
    rootPath: rootPathB,
    relativePath: "utils.ts",
    name: "utils.ts",
    type: "file",
  },
];

const allFileKeys = new Set([
  "file:dir-1:resources/en.json",
  "file:dir-1:resources/ja.json",
  "file:dir-1:client.ts",
  "file:dir-2:utils.ts",
]);

describe("parseFileReferences", () => {
  it("parses include and exclude references with full paths", () => {
    expect(
      parseFileReferences("hello @i18n/client.ts and #lib/utils.ts"),
    ).toEqual({
      includes: ["i18n/client.ts"],
      excludes: ["lib/utils.ts"],
    });
  });
});

describe("parseSelectionTokens", () => {
  it("detects /all token", () => {
    expect(parseSelectionTokens("use /all files")).toEqual({
      includes: [],
      excludes: [],
      selectAll: true,
    });
  });
});

describe("computeCheckedFileKeys", () => {
  it("checks no files by default", () => {
    const checked = computeCheckedFileKeys(items, [], []);

    expect(checked).toEqual(new Set());
  });

  it("checks all files with /all", () => {
    const checked = computeCheckedFileKeys(items, [], [], true);

    expect(checked).toEqual(allFileKeys);
  });

  it("checks only referenced files with @ full path", () => {
    const checked = computeCheckedFileKeys(items, ["i18n/client.ts"], []);

    expect(checked).toEqual(new Set(["file:dir-1:client.ts"]));
  });

  it("does not match files by basename only", () => {
    const checked = computeCheckedFileKeys(items, ["en.json"], []);

    expect(checked).toEqual(new Set());
  });

  it("checks a file with nested full path", () => {
    const checked = computeCheckedFileKeys(
      items,
      ["i18n/resources/en.json"],
      [],
    );

    expect(checked).toEqual(new Set(["file:dir-1:resources/en.json"]));
  });

  it("checks all files in a referenced directory with @", () => {
    const checked = computeCheckedFileKeys(items, ["i18n/resources"], []);

    expect(checked).toEqual(
      new Set(["file:dir-1:resources/en.json", "file:dir-1:resources/ja.json"]),
    );
  });

  it("checks all files in a root directory with @directoryName", () => {
    const checked = computeCheckedFileKeys(items, ["i18n"], []);

    expect(checked).toEqual(
      new Set([
        "file:dir-1:resources/en.json",
        "file:dir-1:resources/ja.json",
        "file:dir-1:client.ts",
      ]),
    );
  });

  it("unchecks referenced files with # full path", () => {
    const checked = computeCheckedFileKeys(items, [], ["i18n/client.ts"]);

    expect(checked).toEqual(
      new Set([
        "file:dir-1:resources/en.json",
        "file:dir-1:resources/ja.json",
        "file:dir-2:utils.ts",
      ]),
    );
  });

  it("prioritizes @ over # when both are present", () => {
    const checked = computeCheckedFileKeys(
      items,
      ["i18n/client.ts"],
      ["i18n/resources"],
    );

    expect(checked).toEqual(new Set(["file:dir-1:client.ts"]));
  });

  it("prioritizes @ over /all when both are present", () => {
    const checked = computeCheckedFileKeys(items, ["i18n/client.ts"], [], true);

    expect(checked).toEqual(new Set(["file:dir-1:client.ts"]));
  });

  it("matches colliding files by absolute path", () => {
    const rootPathC = "/Users/dev/project-c/i18n";
    const collidingItems: DirectorySelectionItem[] = [
      ...items,
      {
        directoryId: "dir-3",
        directoryName: "i18n",
        rootPath: rootPathC,
        relativePath: "client.ts",
        name: "client.ts",
        type: "file",
      },
    ];

    const checked = computeCheckedFileKeys(
      collidingItems,
      [`${rootPathC}/client.ts`],
      [],
    );

    expect(checked).toEqual(new Set(["file:dir-3:client.ts"]));
  });
});

describe("getDirectoryCheckedState", () => {
  const resourcesDir = items[1];

  it("returns false when no descendant files are checked", () => {
    expect(
      getDirectoryCheckedState(items, resourcesDir, new Set()),
    ).toBe(false);
  });

  it("returns true when all descendant files are checked", () => {
    expect(
      getDirectoryCheckedState(
        items,
        resourcesDir,
        new Set([
          "file:dir-1:resources/en.json",
          "file:dir-1:resources/ja.json",
        ]),
      ),
    ).toBe(true);
  });

  it("returns indeterminate when some descendant files are checked", () => {
    expect(
      getDirectoryCheckedState(
        items,
        resourcesDir,
        new Set(["file:dir-1:resources/en.json"]),
      ),
    ).toBe("indeterminate");
  });

  it("returns indeterminate when checked files exist but folder is collapsed", () => {
    const collapsedDir: DirectorySelectionItem = {
      directoryId: "dir-1",
      directoryName: "i18n",
      rootPath: rootPathA,
      relativePath: "unexpanded",
      name: "unexpanded",
      type: "directory",
    };

    expect(
      getDirectoryCheckedState(
        items,
        collapsedDir,
        new Set(["file:dir-1:unexpanded/hidden.ts"]),
      ),
    ).toBe("indeterminate");
  });
});
