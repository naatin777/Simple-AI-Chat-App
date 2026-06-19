export interface ParsedFileKey {
  directoryId: string;
  relativePath: string;
}

export function parseFileKey(key: string): ParsedFileKey | null {
  if (!key.startsWith("file:")) {
    return null;
  }

  const rest = key.slice("file:".length);
  const separatorIndex = rest.indexOf(":");

  if (separatorIndex === -1) {
    return null;
  }

  const directoryId = rest.slice(0, separatorIndex);
  const relativePath = rest.slice(separatorIndex + 1);

  if (!directoryId || !relativePath) {
    return null;
  }

  return { directoryId, relativePath };
}
