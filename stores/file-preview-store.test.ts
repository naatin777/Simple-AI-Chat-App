import { act } from "@testing-library/react";

import { useFilePreviewStore } from "./file-preview-store";

describe("useFilePreviewStore", () => {
  beforeEach(() => {
    useFilePreviewStore.getState().reset();
  });

  it("opens and closes a file", () => {
    act(() => {
      useFilePreviewStore.getState().openFile({
        directoryId: "dir-1",
        relativePath: "client.ts",
        name: "client.ts",
      });
    });

    expect(useFilePreviewStore.getState().activeFile).toEqual({
      directoryId: "dir-1",
      relativePath: "client.ts",
      name: "client.ts",
    });

    act(() => {
      useFilePreviewStore.getState().closeFile();
    });

    expect(useFilePreviewStore.getState().activeFile).toBeNull();
  });

  it("overwrites the active file when opening another", () => {
    act(() => {
      useFilePreviewStore.getState().openFile({
        directoryId: "dir-1",
        relativePath: "client.ts",
        name: "client.ts",
      });
      useFilePreviewStore.getState().openFile({
        directoryId: "dir-1",
        relativePath: "index.ts",
        name: "index.ts",
      });
    });

    expect(useFilePreviewStore.getState().activeFile).toEqual({
      directoryId: "dir-1",
      relativePath: "index.ts",
      name: "index.ts",
    });
  });

  it("resets active file", () => {
    act(() => {
      useFilePreviewStore.getState().openFile({
        directoryId: "dir-1",
        relativePath: "client.ts",
        name: "client.ts",
      });
      useFilePreviewStore.getState().reset();
    });

    expect(useFilePreviewStore.getState().activeFile).toBeNull();
  });
});
