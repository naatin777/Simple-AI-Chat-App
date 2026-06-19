import { act } from "@testing-library/react";

import {
  getActiveAutocompleteTrigger,
  removeReferenceTrigger,
} from "./reference-path";
import {
  filterSlashCommandSuggestions,
  SLASH_COMMANDS,
} from "./slash-commands";
import { nestedI18nItems } from "./test-fixtures";
import { useDirectorySelectionStore } from "@/stores/directory-selection-store";

function resetStore() {
  useDirectorySelectionStore.getState().reset();
}

describe("filterSlashCommandSuggestions", () => {
  it("returns all commands when query is empty", () => {
    expect(filterSlashCommandSuggestions("")).toEqual(SLASH_COMMANDS);
  });

  it("filters commands by prefix", () => {
    expect(filterSlashCommandSuggestions("al").map((command) => command.id)).toEqual(
      ["all"],
    );
    expect(filterSlashCommandSuggestions("n").map((command) => command.id)).toEqual(
      ["none"],
    );
  });
});

describe("slash autocomplete trigger", () => {
  it("detects an active / command at the cursor", () => {
    const input = "hello /al";
    const cursor = input.length;

    expect(getActiveAutocompleteTrigger(input, cursor)).toEqual({
      trigger: "/",
      query: "al",
      replaceStart: 6,
      replaceEnd: cursor,
    });
  });

  it("removes the slash trigger on confirm", () => {
    const input = "check /all";
    const trigger = getActiveAutocompleteTrigger(input, input.length);

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

describe("applySlashCommand", () => {
  beforeEach(() => {
    resetStore();
  });

  it("selects all registered files with /all", () => {
    act(() => {
      for (const item of nestedI18nItems) {
        useDirectorySelectionStore.getState().registerItem(item);
      }
      useDirectorySelectionStore.getState().applySlashCommand("all");
    });

    expect(useDirectorySelectionStore.getState().isManualSelection).toBe(true);
    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set([
        "file:dir-1:resources/en.json",
        "file:dir-1:resources/ja.json",
        "file:dir-1:client.ts",
        "file:dir-1:index.ts",
        "file:dir-2:utils.ts",
      ]),
    );
  });

  it("clears all selections with /none", () => {
    act(() => {
      useDirectorySelectionStore.getState().registerItem(nestedI18nItems[4]);
      useDirectorySelectionStore
        .getState()
        .setFileChecked("file:dir-1:client.ts", true);
      useDirectorySelectionStore.getState().applySlashCommand("none");
    });

    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set(),
    );
    expect(useDirectorySelectionStore.getState().isManualSelection).toBe(true);
  });
});
