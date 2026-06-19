import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_WIDTH_PX = 256;
const MIN_WIDTH_PX = 200;
const MAX_WIDTH_PX = 480;

function clampWidth(width: number): number {
  return Math.min(MAX_WIDTH_PX, Math.max(MIN_WIDTH_PX, width));
}

interface SidebarLayoutStore {
  leftWidthPx: number;
  rightWidthPx: number;
  setLeftWidth: (width: number) => void;
  setRightWidth: (width: number) => void;
}

export const useSidebarLayoutStore = create<SidebarLayoutStore>()(
  persist(
    (set) => ({
      leftWidthPx: DEFAULT_WIDTH_PX,
      rightWidthPx: DEFAULT_WIDTH_PX,
      setLeftWidth: (width) => {
        set({ leftWidthPx: clampWidth(width) });
      },
      setRightWidth: (width) => {
        set({ rightWidthPx: clampWidth(width) });
      },
    }),
    {
      name: "sidebar-layout",
    },
  ),
);

export { DEFAULT_WIDTH_PX, MAX_WIDTH_PX, MIN_WIDTH_PX };
