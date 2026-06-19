import { act } from "@testing-library/react";

import { useDirectorySelectionStore } from "./directory-selection-store";

const rootPath = "/Users/dev/project/i18n";

function fileItem(relativePath: string, name = relativePath) {
  return {
    directoryId: "dir-1",
    directoryName: "i18n",
    rootPath,
    relativePath,
    name,
    type: "file" as const,
  };
}

function resetStore() {
  useDirectorySelectionStore.getState().reset();
}

describe("useDirectorySelectionStore", () => {
  beforeEach(() => {
    resetStore();
  });

  it("checks no files by default", () => {
    act(() => {
      useDirectorySelectionStore.getState().registerItem(fileItem("client.ts"));
      useDirectorySelectionStore.getState().registerItem(fileItem("index.ts"));
    });

    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set(),
    );
  });

  it("applies /all from chat input", () => {
    act(() => {
      useDirectorySelectionStore.getState().registerItem(fileItem("client.ts"));
      useDirectorySelectionStore.getState().registerItem(fileItem("index.ts"));
    });

    act(() => {
      useDirectorySelectionStore
        .getState()
        .applyInputReferences("include /all files");
    });

    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set(["file:dir-1:client.ts", "file:dir-1:index.ts"]),
    );
  });

  it("applies @ references from chat input", () => {
    act(() => {
      useDirectorySelectionStore.getState().registerItem(fileItem("client.ts"));
      useDirectorySelectionStore.getState().registerItem(fileItem("index.ts"));
    });

    act(() => {
      useDirectorySelectionStore
        .getState()
        .applyInputReferences("please review @i18n/client.ts");
    });

    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set(["file:dir-1:client.ts"]),
    );
  });

  it("applies # references from chat input", () => {
    act(() => {
      useDirectorySelectionStore.getState().registerItem(fileItem("client.ts"));
      useDirectorySelectionStore.getState().registerItem(fileItem("index.ts"));
    });

    act(() => {
      useDirectorySelectionStore
        .getState()
        .applyInputReferences("ignore #i18n/client.ts");
    });

    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set(["file:dir-1:index.ts"]),
    );
  });

  it("prioritizes @ over # in chat input", () => {
    act(() => {
      useDirectorySelectionStore.getState().registerItem(fileItem("client.ts"));
      useDirectorySelectionStore.getState().registerItem(fileItem("index.ts"));
    });

    act(() => {
      useDirectorySelectionStore
        .getState()
        .applyInputReferences("@i18n/client.ts #i18n/index.ts");
    });

    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set(["file:dir-1:client.ts"]),
    );
  });

  it("preserves manual selection when typing unrelated text", () => {
    act(() => {
      useDirectorySelectionStore.getState().registerItem(fileItem("client.ts"));
      useDirectorySelectionStore.getState().registerItem(fileItem("index.ts"));
      useDirectorySelectionStore
        .getState()
        .setFileChecked("file:dir-1:client.ts", true);
    });

    act(() => {
      useDirectorySelectionStore
        .getState()
        .applyInputReferences("hello world");
    });

    expect(useDirectorySelectionStore.getState().isManualSelection).toBe(true);
    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set(["file:dir-1:client.ts"]),
    );
  });

  it("overrides manual selection when @ tokens appear", () => {
    act(() => {
      useDirectorySelectionStore.getState().registerItem(fileItem("client.ts"));
      useDirectorySelectionStore.getState().registerItem(fileItem("index.ts"));
      useDirectorySelectionStore
        .getState()
        .setFileChecked("file:dir-1:client.ts", true);
    });

    act(() => {
      useDirectorySelectionStore
        .getState()
        .applyInputReferences("use @i18n/index.ts");
    });

    expect(useDirectorySelectionStore.getState().isManualSelection).toBe(false);
    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set(["file:dir-1:index.ts"]),
    );
  });

  it("does not resync checks when registering items during manual selection", () => {
    act(() => {
      useDirectorySelectionStore.getState().registerItem(fileItem("client.ts"));
      useDirectorySelectionStore
        .getState()
        .setFileChecked("file:dir-1:client.ts", true);
    });

    act(() => {
      useDirectorySelectionStore.getState().registerItem(fileItem("index.ts"));
    });

    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set(["file:dir-1:client.ts"]),
    );
  });

  it("shows unregistered files as unchecked by default", () => {
    expect(
      useDirectorySelectionStore.getState().isFileChecked(fileItem("client.ts")),
    ).toBe(false);
  });

  it("bulk registers files without duplicates", () => {
    act(() => {
      useDirectorySelectionStore.getState().registerDirectoryFiles([
        fileItem("client.ts"),
        fileItem("client.ts"),
        fileItem("index.ts"),
      ]);
    });

    expect(useDirectorySelectionStore.getState().items).toHaveLength(2);
  });

  it("syncs /all after subtree files are registered", () => {
    act(() => {
      useDirectorySelectionStore.getState().registerSubtreeFiles(
        {
          directoryId: "dir-1",
          directoryName: "i18n",
          rootPath,
        },
        [
          { path: "client.ts", name: "client.ts" },
          { path: "index.ts", name: "index.ts" },
        ],
      );
      useDirectorySelectionStore
        .getState()
        .applyInputReferences("include /all files");
    });

    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set(["file:dir-1:client.ts", "file:dir-1:index.ts"]),
    );
  });

  it("applies autocomplete include in manual mode", () => {
    act(() => {
      useDirectorySelectionStore.getState().registerItem(fileItem("client.ts"));
      useDirectorySelectionStore.getState().registerItem(fileItem("index.ts"));
      useDirectorySelectionStore
        .getState()
        .applyAutocompleteSelection("i18n/client.ts", "include");
    });

    expect(useDirectorySelectionStore.getState().isManualSelection).toBe(true);
    expect(useDirectorySelectionStore.getState().checkedFileKeys).toEqual(
      new Set(["file:dir-1:client.ts"]),
    );
  });
});
