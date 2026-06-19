import {
  getItemAbsoluteReferencePath,
  getItemShortReferencePath,
  hasShortReferenceCollision,
} from "./reference-path";

export interface DirectorySelectionItem {
  directoryId: string;
  directoryName: string;
  /** Absolute filesystem path of the conversation directory root. */
  rootPath: string;
  relativePath: string;
  name: string;
  type: "directory" | "file";
}

export function selectionItemKey(item: DirectorySelectionItem): string {
  if (item.type === "file") {
    return `file:${item.directoryId}:${item.relativePath}`;
  }

  return `dir:${item.directoryId}:${item.relativePath}`;
}

export function isFileKey(key: string): boolean {
  return key.startsWith("file:");
}

export interface SelectionTokens {
  includes: string[];
  excludes: string[];
  selectAll: boolean;
}

export function parseSelectionTokens(input: string): SelectionTokens {
  const includes = [...input.matchAll(/@([^\s#@]+)/g)].map((match) => match[1]);
  const excludes = [...input.matchAll(/#([^\s#@]+)/g)].map((match) => match[1]);
  const selectAll = /(?:^|\s)\/all(?:\s|$)/.test(input);

  return { includes, excludes, selectAll };
}

export function hasSelectionTokens(tokens: SelectionTokens): boolean {
  return (
    tokens.includes.length > 0 ||
    tokens.excludes.length > 0 ||
    tokens.selectAll
  );
}

export function selectionTokensEqual(
  left: SelectionTokens,
  right: SelectionTokens,
): boolean {
  return (
    left.selectAll === right.selectAll &&
    left.includes.join("\0") === right.includes.join("\0") &&
    left.excludes.join("\0") === right.excludes.join("\0")
  );
}

export function parseFileReferences(input: string): {
  includes: string[];
  excludes: string[];
} {
  const { includes, excludes } = parseSelectionTokens(input);
  return { includes, excludes };
}

export { getItemReferencePath } from "./reference-path";

function normalizeReference(reference: string): string {
  return reference.replace(/\/+$/, "");
}

function itemMatchesReference(
  item: DirectorySelectionItem,
  reference: string,
  items: DirectorySelectionItem[],
): boolean {
  const normalized = normalizeReference(reference);
  const absolute = normalizeReference(getItemAbsoluteReferencePath(item));

  if (normalized === absolute) {
    return true;
  }

  if (hasShortReferenceCollision(items, item)) {
    return false;
  }

  return (
    normalized === normalizeReference(getItemShortReferencePath(item))
  );
}

function isFileUnderDirectory(
  file: DirectorySelectionItem,
  directory: DirectorySelectionItem,
): boolean {
  if (file.type !== "file" || directory.type !== "directory") {
    return false;
  }

  if (file.directoryId !== directory.directoryId) {
    return false;
  }

  if (directory.relativePath === "") {
    return true;
  }

  return (
    file.relativePath === directory.relativePath ||
    file.relativePath.startsWith(`${directory.relativePath}/`)
  );
}

export function resolveReferenceToFileKeys(
  items: DirectorySelectionItem[],
  reference: string,
): Set<string> {
  const fileItems = items.filter((item) => item.type === "file");
  const matchedKeys = new Set<string>();

  for (const item of items) {
    if (!itemMatchesReference(item, reference, items)) {
      continue;
    }

    if (item.type === "file") {
      matchedKeys.add(selectionItemKey(item));
      continue;
    }

    for (const file of fileItems) {
      if (isFileUnderDirectory(file, item)) {
        matchedKeys.add(selectionItemKey(file));
      }
    }
  }

  return matchedKeys;
}

export function computeCheckedFileKeys(
  items: DirectorySelectionItem[],
  includes: string[],
  excludes: string[],
  selectAll = false,
): Set<string> {
  const fileItems = items.filter((item) => item.type === "file");
  const allFileKeys = new Set(fileItems.map((item) => selectionItemKey(item)));

  if (includes.length > 0) {
    const matchedKeys = new Set<string>();

    for (const reference of includes) {
      for (const key of resolveReferenceToFileKeys(items, reference)) {
        matchedKeys.add(key);
      }
    }

    return matchedKeys;
  }

  if (excludes.length > 0) {
    const excludedKeys = new Set<string>();

    for (const reference of excludes) {
      for (const key of resolveReferenceToFileKeys(items, reference)) {
        excludedKeys.add(key);
      }
    }

    return new Set(
      [...allFileKeys].filter((key) => !excludedKeys.has(key)),
    );
  }

  if (selectAll) {
    return allFileKeys;
  }

  return new Set();
}

function getCheckedKeysInSubtree(
  directoryId: string,
  relativePath: string,
  checkedFileKeys: Set<string>,
): string[] {
  const prefix = `file:${directoryId}:`;

  return [...checkedFileKeys].filter((key) => {
    if (!key.startsWith(prefix)) {
      return false;
    }

    const fileRelativePath = key.slice(prefix.length);

    if (relativePath === "") {
      return true;
    }

    return (
      fileRelativePath === relativePath ||
      fileRelativePath.startsWith(`${relativePath}/`)
    );
  });
}

export function getRootDirectoryCheckedState(
  items: DirectorySelectionItem[],
  directoryId: string,
  checkedFileKeys: Set<string>,
): boolean | "indeterminate" {
  const fileKeys = items
    .filter(
      (item) => item.type === "file" && item.directoryId === directoryId,
    )
    .map((item) => selectionItemKey(item));

  if (fileKeys.length === 0) {
    return getCheckedKeysInSubtree(directoryId, "", checkedFileKeys).length > 0
      ? "indeterminate"
      : false;
  }

  const checkedCount = fileKeys.filter((key) =>
    checkedFileKeys.has(key),
  ).length;

  if (checkedCount === 0) {
    return false;
  }

  if (checkedCount === fileKeys.length) {
    return true;
  }

  return "indeterminate";
}

export function getDirectoryCheckedState(
  items: DirectorySelectionItem[],
  directory: DirectorySelectionItem,
  checkedFileKeys: Set<string>,
): boolean | "indeterminate" {
  const fileKeys = items
    .filter((item) => item.type === "file" && isFileUnderDirectory(item, directory))
    .map((item) => selectionItemKey(item));

  if (fileKeys.length === 0) {
    return getCheckedKeysInSubtree(
      directory.directoryId,
      directory.relativePath,
      checkedFileKeys,
    ).length > 0
      ? "indeterminate"
      : false;
  }

  const checkedCount = fileKeys.filter((key) =>
    checkedFileKeys.has(key),
  ).length;

  if (checkedCount === 0) {
    return false;
  }

  if (checkedCount === fileKeys.length) {
    return true;
  }

  return "indeterminate";
}
