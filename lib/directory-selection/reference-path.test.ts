import type { DirectorySelectionItem } from "./index";
import {
  filterReferenceSuggestions,
  getActiveReferenceTrigger,
  getItemReferencePath,
  getRegisteredReferencePaths,
  removeReferenceTrigger,
} from "./reference-path";

const rootPathA = "/Users/dev/project-a/i18n";
const rootPathB = "/Users/dev/project-b/i18n";

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
    relativePath: "resources/en.json",
    name: "en.json",
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
];

const collidingItems: DirectorySelectionItem[] = [
  ...items,
  {
    directoryId: "dir-2",
    directoryName: "i18n",
    rootPath: rootPathB,
    relativePath: "",
    name: "i18n",
    type: "directory",
  },
  {
    directoryId: "dir-2",
    directoryName: "i18n",
    rootPath: rootPathB,
    relativePath: "client.ts",
    name: "client.ts",
    type: "file",
  },
];

describe("getItemReferencePath", () => {
  it("builds short paths when names are unique", () => {
    expect(getItemReferencePath(items[0], items)).toBe("i18n");
    expect(getItemReferencePath(items[1], items)).toBe("i18n/resources/en.json");
    expect(getItemReferencePath(items[2], items)).toBe("i18n/client.ts");
  });

  it("uses absolute paths when short paths collide", () => {
    expect(getItemReferencePath(collidingItems[0], collidingItems)).toBe(
      rootPathA,
    );
    expect(getItemReferencePath(collidingItems[2], collidingItems)).toBe(
      `${rootPathA}/client.ts`,
    );
    expect(getItemReferencePath(collidingItems[4], collidingItems)).toBe(
      `${rootPathB}/client.ts`,
    );
  });
});

describe("getActiveReferenceTrigger", () => {
  it("detects an active @ reference at the cursor", () => {
    const input = "please review @i18n/res";
    const cursor = input.length;

    expect(getActiveReferenceTrigger(input, cursor)).toEqual({
      trigger: "@",
      query: "i18n/res",
      replaceStart: 14,
      replaceEnd: cursor,
    });
  });
});

describe("filterReferenceSuggestions", () => {
  it("prioritizes prefix matches", () => {
    const paths = getRegisteredReferencePaths(items);

    expect(filterReferenceSuggestions(paths, "i18n/resources")).toEqual([
      "i18n/resources/en.json",
    ]);
  });
});

describe("removeReferenceTrigger", () => {
  it("removes the active trigger without inserting a suggestion", () => {
    const input = "check @i18n/";
    const trigger = getActiveReferenceTrigger(input, input.length);

    expect(trigger).not.toBeNull();
    if (!trigger) {
      return;
    }

    expect(removeReferenceTrigger(input, trigger)).toEqual({
      value: "check ",
      cursor: 6,
    });
  });
});
