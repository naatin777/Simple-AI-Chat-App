import type { DirectorySelectionItem } from "./index";

export function getItemShortReferencePath(item: DirectorySelectionItem): string {
  if (item.relativePath === "") {
    return item.directoryName;
  }

  return `${item.directoryName}/${item.relativePath}`;
}

export function getItemAbsoluteReferencePath(
  item: DirectorySelectionItem,
): string {
  if (item.relativePath === "") {
    return item.rootPath;
  }

  return `${item.rootPath}/${item.relativePath}`;
}

export function hasShortReferenceCollision(
  items: DirectorySelectionItem[],
  item: DirectorySelectionItem,
): boolean {
  const short = getItemShortReferencePath(item);

  return items.some(
    (other) =>
      other.directoryId !== item.directoryId &&
      getItemShortReferencePath(other) === short,
  );
}

export function getItemReferencePath(
  item: DirectorySelectionItem,
  allItems: DirectorySelectionItem[] = [item],
): string {
  if (hasShortReferenceCollision(allItems, item)) {
    return getItemAbsoluteReferencePath(item);
  }

  return getItemShortReferencePath(item);
}

export function getRegisteredReferencePaths(
  items: DirectorySelectionItem[],
): string[] {
  const paths = new Set<string>();

  for (const item of items) {
    paths.add(getItemReferencePath(item, items));
  }

  return [...paths].sort((left, right) => left.localeCompare(right));
}

export interface ActiveReferenceTrigger {
  trigger: "@" | "#" | "/";
  query: string;
  replaceStart: number;
  replaceEnd: number;
}

export function getActiveReferenceTrigger(
  input: string,
  cursor: number,
): ActiveReferenceTrigger | null {
  const before = input.slice(0, cursor);

  const match = /[@#]([^\s#@]*)$/.exec(before);

  if (match?.index === undefined) {
    return null;
  }

  const trigger = match[0][0];

  if (trigger !== "@" && trigger !== "#") {
    return null;
  }

  return {
    trigger,
    query: match[1],
    replaceStart: match.index,
    replaceEnd: cursor,
  };
}

function getActiveSlashTrigger(
  input: string,
  cursor: number,
): ActiveReferenceTrigger | null {
  const before = input.slice(0, cursor);
  const slashMatch = /(?:^|\s)(\/[a-z]*)$/.exec(before);

  if (!slashMatch?.[1]) {
    return null;
  }

  const token = slashMatch[1];
  const replaceStart = before.length - token.length;

  return {
    trigger: "/",
    query: token.slice(1),
    replaceStart,
    replaceEnd: cursor,
  };
}

export function getActiveAutocompleteTrigger(
  input: string,
  cursor: number,
): ActiveReferenceTrigger | null {
  return getActiveReferenceTrigger(input, cursor) ?? getActiveSlashTrigger(input, cursor);
}

export function filterReferenceSuggestions(
  paths: string[],
  query: string,
  limit = 12,
): string[] {
  const normalizedQuery = query.toLowerCase();

  return paths
    .filter((path) => {
      const normalizedPath = path.toLowerCase();
      return normalizedQuery === ""
        ? true
        : normalizedPath.includes(normalizedQuery);
    })
    .sort((left, right) => {
      const leftLower = left.toLowerCase();
      const rightLower = right.toLowerCase();

      if (normalizedQuery === "") {
        return left.localeCompare(right);
      }

      const leftStarts = leftLower.startsWith(normalizedQuery);
      const rightStarts = rightLower.startsWith(normalizedQuery);

      if (leftStarts !== rightStarts) {
        return leftStarts ? -1 : 1;
      }

      return left.localeCompare(right);
    })
    .slice(0, limit);
}

export function removeReferenceTrigger(
  input: string,
  trigger: ActiveReferenceTrigger,
): { value: string; cursor: number } {
  const before = input.slice(0, trigger.replaceStart);
  const after = input.slice(trigger.replaceEnd);
  const value = `${before}${after}`;
  const cursor = before.length;

  return { value, cursor };
}

/** @deprecated Autocomplete no longer inserts paths into input. */
export function applyReferenceSuggestion(
  input: string,
  trigger: ActiveReferenceTrigger,
  suggestion: string,
): { value: string; cursor: number } {
  void suggestion;
  return removeReferenceTrigger(input, trigger);
}
