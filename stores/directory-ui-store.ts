import { create } from "zustand";

interface DirectoryUiStore {
  expandedDirectoryIds: Set<string>;
  setExpandedDirectoryIds: (ids: Set<string>) => void;
  toggleDirectory: (directoryId: string) => void;
  addExpandedDirectory: (directoryId: string) => void;
  removeExpandedDirectory: (directoryId: string) => void;
  reset: () => void;
}

export const useDirectoryUiStore = create<DirectoryUiStore>((set) => ({
  expandedDirectoryIds: new Set(),
  setExpandedDirectoryIds: (ids) => {
    set({ expandedDirectoryIds: ids });
  },
  toggleDirectory: (directoryId) => {
    set((state) => {
      const next = new Set(state.expandedDirectoryIds);
      if (next.has(directoryId)) {
        next.delete(directoryId);
      } else {
        next.add(directoryId);
      }
      return { expandedDirectoryIds: next };
    });
  },
  addExpandedDirectory: (directoryId) => {
    set((state) => {
      const next = new Set(state.expandedDirectoryIds);
      next.add(directoryId);
      return { expandedDirectoryIds: next };
    });
  },
  removeExpandedDirectory: (directoryId) => {
    set((state) => {
      const next = new Set(state.expandedDirectoryIds);
      next.delete(directoryId);
      return { expandedDirectoryIds: next };
    });
  },
  reset: () => {
    set({ expandedDirectoryIds: new Set() });
  },
}));
