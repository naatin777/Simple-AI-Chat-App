import { act } from "@testing-library/react";

import {
  collidingI18nItems,
  nestedI18nItems,
  rootPathB,
} from "./test-fixtures";
import { resolveReferenceToFileKeys } from "./index";
import {
  getItemReferencePath,
  getRegisteredReferencePaths,
  removeReferenceTrigger,
} from "./reference-path";
import { useDirectorySelectionStore } from "@/stores/directory-selection-store";

function resetStore() {
  useDirectorySelectionStore.getState().reset();
}

describe("removeReferenceTrigger", () => {
  it("removes an active @ trigger from the middle of input", () => {
    const input = "hello @i18n/cl world";
    const trigger = {
      trigger: "@" as const,
      query: "i18n/cl",
      replaceStart: 6,
      replaceEnd: 14,
    };

    expect(removeReferenceTrigger(input, trigger)).toEqual({
      value: "hello  world",
      cursor: 6,
    });
  });

  it("removes a # trigger at the start", () => {
    const input = "#i18n/client.ts rest";
    const trigger = {
      trigger: "#" as const,
      query: "i18n/client.ts",
      replaceStart: 0,
      replaceEnd: 15,
    };

    expect(removeReferenceTrigger(input, trigger)).toEqual({
      value: " rest",
      cursor: 0,
    });
  });
});

describe("autocomplete collision paths", () => {
  it("shows absolute paths in suggestions when short paths collide", () => {
    const items = collidingI18nItems();
    const paths = getRegisteredReferencePaths(items);

    expect(paths).toContain(`${rootPathB}/client.ts`);
    expect(paths).toContain(`${nestedI18nItems[4].rootPath}/client.ts`);
  });
});

describe("resolveReferenceToFileKeys", () => {
  it("resolves a directory reference to all descendant files", () => {
    const keys = resolveReferenceToFileKeys(nestedI18nItems, "i18n/resources");

    expect(keys).toEqual(
      new Set([
        "file:dir-1:resources/en.json",
        "file:dir-1:resources/ja.json",
      ]),
    );
  });

  it("resolves absolute path when short path collides", () => {
    const items = collidingI18nItems();
    const keys = resolveReferenceToFileKeys(
      items,
      `${rootPathB}/client.ts`,
    );

    expect(keys).toEqual(new Set(["file:dir-3:client.ts"]));
  });
});

describe("applyAutocompleteSelection", () => {
  beforeEach(() => {
    resetStore();
  });

  it("checks files on include without leaving tokens in reference input", () => {
    act(() => {
      for (const item of nestedI18nItems) {
        useDirectorySelectionStore.getState().registerItem(item);
      }
      useDirectorySelectionStore
        .getState()
        .applyAutocompleteSelection("i18n/client.ts", "include");
    });

    const state = useDirectorySelectionStore.getState();
    expect(state.isManualSelection).toBe(true);
    expect(state.checkedFileKeys).toEqual(new Set(["file:dir-1:client.ts"]));
  });

  it("unchecks files on exclude", () => {
    act(() => {
      for (const item of nestedI18nItems) {
        useDirectorySelectionStore.getState().registerItem(item);
      }
      useDirectorySelectionStore
        .getState()
        .setFileChecked("file:dir-1:client.ts", true);
      useDirectorySelectionStore
        .getState()
        .setFileChecked("file:dir-1:index.ts", true);
      useDirectorySelectionStore
        .getState()
        .applyAutocompleteSelection("i18n/client.ts", "exclude");
    });

    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set(["file:dir-1:index.ts"]),
    );
  });

  it("adds directory subtree files on include", () => {
    act(() => {
      for (const item of nestedI18nItems) {
        useDirectorySelectionStore.getState().registerItem(item);
      }
      useDirectorySelectionStore
        .getState()
        .applyAutocompleteSelection("i18n/resources", "include");
    });

    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set([
        "file:dir-1:resources/en.json",
        "file:dir-1:resources/ja.json",
      ]),
    );
  });
});

describe("getItemReferencePath for autocomplete display", () => {
  it("uses short path when unique", () => {
    expect(getItemReferencePath(nestedI18nItems[4], nestedI18nItems)).toBe(
      "i18n/client.ts",
    );
  });

  it("uses absolute path when colliding", () => {
    const items = collidingI18nItems();
    const dir3Client = items.find(
      (item) => item.directoryId === "dir-3" && item.type === "file",
    );

    expect(dir3Client).toBeDefined();
    if (!dir3Client) {
      return;
    }

    expect(getItemReferencePath(dir3Client, items)).toBe(
      `${rootPathB}/client.ts`,
    );
  });
});
