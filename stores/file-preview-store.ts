import { create } from "zustand";

export interface OpenFile {
  directoryId: string;
  relativePath: string;
  name: string;
}

interface FilePreviewStore {
  activeFile: OpenFile | null;
  openFile: (file: OpenFile) => void;
  closeFile: () => void;
  reset: () => void;
}

export const useFilePreviewStore = create<FilePreviewStore>((set) => ({
  activeFile: null,
  openFile: (file) => {
    set({ activeFile: file });
  },
  closeFile: () => {
    set({ activeFile: null });
  },
  reset: () => {
    set({ activeFile: null });
  },
}));
