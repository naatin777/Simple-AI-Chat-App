import path from "node:path";

export function resolveSafePath(rootPath: string, relativePath = ""): string {
  const resolvedRoot = path.resolve(rootPath);
  const resolvedTarget = path.resolve(resolvedRoot, relativePath);

  if (
    resolvedTarget !== resolvedRoot &&
    !resolvedTarget.startsWith(resolvedRoot + path.sep)
  ) {
    throw new Error("Path traversal detected");
  }

  return resolvedTarget;
}

export function toRelativePath(rootPath: string, absolutePath: string): string {
  const resolvedRoot = path.resolve(rootPath);
  const resolvedTarget = path.resolve(absolutePath);

  if (resolvedTarget === resolvedRoot) {
    return "";
  }

  if (!resolvedTarget.startsWith(resolvedRoot + path.sep)) {
    throw new Error("Path is outside root");
  }

  return path.relative(resolvedRoot, resolvedTarget);
}
