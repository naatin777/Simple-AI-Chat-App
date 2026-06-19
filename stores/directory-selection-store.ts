import { create } from "zustand";

import {
  computeCheckedFileKeys,
  getDirectoryCheckedState,
  getRootDirectoryCheckedState,
  hasSelectionTokens,
  parseSelectionTokens,
  resolveReferenceToFileKeys,
  selectionItemKey,
  selectionTokensEqual,
  type DirectorySelectionItem,
} from "@/lib/directory-selection";
import { isSlashCommandId } from "@/lib/directory-selection/slash-commands";

interface DirectorySelectionStore {
  items: DirectorySelectionItem[];
  checkedFileKeys: Set<string>;
  referenceInput: string;
  isManualSelection: boolean;
  registerItem: (item: DirectorySelectionItem) => void;
  registerDirectoryFiles: (items: DirectorySelectionItem[]) => void;
  registerSubtreeFiles: (
    directory: Pick<
      DirectorySelectionItem,
      "directoryId" | "directoryName" | "rootPath"
    >,
    files: { path: string; name: string }[],
  ) => void;
  unregisterDirectory: (directoryId: string) => void;
  setFileChecked: (key: string, checked: boolean) => void;
  setDirectoryFilesChecked: (
    directory: DirectorySelectionItem,
    checked: boolean,
  ) => void;
  setRootDirectoryFilesChecked: (
    directoryId: string,
    checked: boolean,
  ) => void;
  applyAutocompleteSelection: (
    reference: string,
    mode: "include" | "exclude",
  ) => void;
  applySlashCommand: (commandId: string) => void;
  isFileChecked: (item: DirectorySelectionItem) => boolean;
  getDirectoryCheckboxState: (
    directory: DirectorySelectionItem,
  ) => boolean | "indeterminate";
  getRootCheckboxState: (
    directoryId: string,
  ) => boolean | "indeterminate";
  applyInputReferences: (input: string) => void;
  syncAutomaticSelection: () => void;
  reset: () => void;
}

function getAutomaticCheckedKeys(
  items: DirectorySelectionItem[],
  input: string,
): Set<string> {
  const { includes, excludes, selectAll } = parseSelectionTokens(input);
  return computeCheckedFileKeys(items, includes, excludes, selectAll);
}

const initialState = {
  items: [] as DirectorySelectionItem[],
  checkedFileKeys: new Set<string>(),
  referenceInput: "",
  isManualSelection: false,
};

export const useDirectorySelectionStore = create<DirectorySelectionStore>(
  (set, get) => ({
    ...initialState,

    registerItem: (item) => {
      set((state) => {
        const key = selectionItemKey(item);
        if (
          state.items.some(
            (existing) => selectionItemKey(existing) === key,
          )
        ) {
          return state;
        }

        return { items: [...state.items, item] };
      });

      if (!get().isManualSelection) {
        get().syncAutomaticSelection();
      }
    },

    registerDirectoryFiles: (newItems) => {
      const previousCount = get().items.length;

      set((state) => {
        const existingKeys = new Set(
          state.items.map((item) => selectionItemKey(item)),
        );
        const merged = [...state.items];

        for (const item of newItems) {
          const key = selectionItemKey(item);
          if (existingKeys.has(key)) {
            continue;
          }

          existingKeys.add(key);
          merged.push(item);
        }

        if (merged.length === state.items.length) {
          return state;
        }

        return { items: merged };
      });

      if (get().items.length > previousCount && !get().isManualSelection) {
        get().syncAutomaticSelection();
      }
    },

    registerSubtreeFiles: (directory, files) => {
      get().registerDirectoryFiles(
        files.map((file) => ({
          directoryId: directory.directoryId,
          directoryName: directory.directoryName,
          rootPath: directory.rootPath,
          relativePath: file.path,
          name: file.name,
          type: "file" as const,
        })),
      );
    },

    unregisterDirectory: (directoryId) => {
      set((state) => ({
        items: state.items.filter((item) => item.directoryId !== directoryId),
        checkedFileKeys: new Set(
          [...state.checkedFileKeys].filter(
            (key) => !key.startsWith(`file:${directoryId}:`),
          ),
        ),
      }));
    },

    applyInputReferences: (input) => {
      const state = get();
      const tokens = parseSelectionTokens(input);
      const previousTokens = parseSelectionTokens(state.referenceInput);

      if (selectionTokensEqual(tokens, previousTokens)) {
        if (input !== state.referenceInput) {
          set({ referenceInput: input });
        }
        return;
      }

      if (hasSelectionTokens(tokens)) {
        set({
          referenceInput: input,
          isManualSelection: false,
          checkedFileKeys: getAutomaticCheckedKeys(state.items, input),
        });
        return;
      }

      if (state.isManualSelection) {
        set({ referenceInput: input });
        return;
      }

      set({
        referenceInput: input,
        checkedFileKeys: new Set(),
      });
    },

    applyAutocompleteSelection: (reference, mode) => {
      const { items } = get();
      const matchedKeys = resolveReferenceToFileKeys(items, reference);

      set((state) => {
        const next = new Set(state.checkedFileKeys);

        for (const key of matchedKeys) {
          if (mode === "include") {
            next.add(key);
          } else {
            next.delete(key);
          }
        }

        return {
          checkedFileKeys: next,
          isManualSelection: true,
        };
      });
    },

    applySlashCommand: (commandId) => {
      if (!isSlashCommandId(commandId)) {
        return;
      }

      const { items } = get();
      const fileKeys = items
        .filter((item) => item.type === "file")
        .map((item) => selectionItemKey(item));

      if (commandId === "all") {
        set({
          checkedFileKeys: new Set(fileKeys),
          isManualSelection: true,
        });
        return;
      }

      set({
        checkedFileKeys: new Set(),
        isManualSelection: true,
      });
    },

    syncAutomaticSelection: () => {
      const { isManualSelection, items, referenceInput } = get();
      const fileItems = items.filter((item) => item.type === "file");

      if (isManualSelection || fileItems.length === 0) {
        return;
      }

      set({
        checkedFileKeys: getAutomaticCheckedKeys(items, referenceInput),
      });
    },

    setFileChecked: (key, checked) => {
      set((state) => {
        const next = new Set(state.checkedFileKeys);
        if (checked) {
          next.add(key);
        } else {
          next.delete(key);
        }
        return { checkedFileKeys: next, isManualSelection: true };
      });
    },

    setDirectoryFilesChecked: (directory, checked) => {
      set((state) => {
        const next = new Set(state.checkedFileKeys);
        for (const item of state.items) {
          if (
            item.type !== "file" ||
            item.directoryId !== directory.directoryId
          ) {
            continue;
          }

          if (
            directory.relativePath !== "" &&
            item.relativePath !== directory.relativePath &&
            !item.relativePath.startsWith(`${directory.relativePath}/`)
          ) {
            continue;
          }

          const key = selectionItemKey(item);
          if (checked) {
            next.add(key);
          } else {
            next.delete(key);
          }
        }
        return { checkedFileKeys: next, isManualSelection: true };
      });
    },

    setRootDirectoryFilesChecked: (directoryId, checked) => {
      set((state) => {
        const next = new Set(state.checkedFileKeys);
        for (const item of state.items) {
          if (item.type !== "file" || item.directoryId !== directoryId) {
            continue;
          }

          const key = selectionItemKey(item);
          if (checked) {
            next.add(key);
          } else {
            next.delete(key);
          }
        }
        return { checkedFileKeys: next, isManualSelection: true };
      });
    },

    isFileChecked: (item) => {
      if (item.type !== "file") {
        return false;
      }
      return get().checkedFileKeys.has(selectionItemKey(item));
    },

    getDirectoryCheckboxState: (directory) =>
      getDirectoryCheckedState(
        get().items,
        directory,
        get().checkedFileKeys,
      ),

    getRootCheckboxState: (directoryId) =>
      getRootDirectoryCheckedState(
        get().items,
        directoryId,
        get().checkedFileKeys,
      ),

    reset: () => {
      set({ ...initialState, checkedFileKeys: new Set() });
    },
  }),
);
