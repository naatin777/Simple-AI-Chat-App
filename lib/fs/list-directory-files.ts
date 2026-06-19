import fs from "node:fs/promises";
import path from "node:path";

import { resolveSafePath, toRelativePath } from "@/lib/fs/path-guard";

export interface ListedFile {
  path: string;
  name: string;
}

export async function listAllFilesUnder(
  rootPath: string,
  relativePath = "",
): Promise<ListedFile[]> {
  const absolutePath = resolveSafePath(rootPath, relativePath);
  const files: ListedFile[] = [];

  async function walk(currentAbsolutePath: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(currentAbsolutePath, { withFileTypes: true });
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

    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }

      const absoluteEntryPath = path.join(currentAbsolutePath, entry.name);
      const entryRelativePath = toRelativePath(rootPath, absoluteEntryPath);

      if (entry.isDirectory()) {
        await walk(absoluteEntryPath);
        continue;
      }

      if (entry.isFile()) {
        files.push({
          path: entryRelativePath,
          name: entry.name,
        });
      }
    }
  }

  await walk(absolutePath);

  return files.sort((left, right) => left.path.localeCompare(right.path));
}
