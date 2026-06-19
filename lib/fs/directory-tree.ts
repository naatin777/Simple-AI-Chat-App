import fs from "node:fs/promises";
import path from "node:path";
import type { DirectoryTreeNode } from "@/lib/openapi/schemas/directory";
import { resolveSafePath, toRelativePath } from "@/lib/fs/path-guard";

export async function listDirectoryChildren(
  rootPath: string,
  relativePath = "",
): Promise<{
  rootPath: string;
  relativePath: string;
  nodes: DirectoryTreeNode[];
}> {
  const absolutePath = resolveSafePath(rootPath, relativePath);

  let entries;
  try {
    entries = await fs.readdir(absolutePath, { withFileTypes: true });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error.code === "ENOENT" || error.code === "ENOTDIR")
    ) {
      throw new Error("Directory not found");
    }

    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "EACCES"
    ) {
      throw new Error("Permission denied");
    }

    throw error;
  }

  const nodes: DirectoryTreeNode[] = entries
    .filter((entry) => !entry.name.startsWith("."))
    .map((entry) => {
      const absoluteEntryPath = path.join(absolutePath, entry.name);
      const entryRelativePath = toRelativePath(rootPath, absoluteEntryPath);

      return {
        name: entry.name,
        path: entryRelativePath,
        type: entry.isDirectory() ? ("directory" as const) : ("file" as const),
      };
    })
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });

  return {
    rootPath: path.resolve(rootPath),
    relativePath,
    nodes,
  };
}
