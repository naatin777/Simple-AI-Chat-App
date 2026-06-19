export const TREE_BASE_PADDING_PX = 8;
export const TREE_INDENT_PX = 16;

export function treePadding(depth: number) {
  return TREE_BASE_PADDING_PX + depth * TREE_INDENT_PX;
}

export const treeRowClassName =
  "flex h-7 w-full min-w-0 items-center pr-2 text-left text-sm";

export const treeLabelButtonClassName =
  "flex min-w-0 flex-1 items-center gap-1 overflow-hidden text-left";

/** Fixed right column for checkboxes and row actions (e.g. trash). */
export const treeActionColumnClassName =
  "flex w-7 shrink-0 items-center justify-center";
