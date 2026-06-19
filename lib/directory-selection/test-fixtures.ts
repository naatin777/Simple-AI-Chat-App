import type { DirectorySelectionItem } from "./index";

export const rootPathA = "/Users/dev/project-a/i18n";
export const rootPathB = "/Users/dev/project-b/i18n";
export const rootPathLib = "/Users/dev/project-b/lib";

export const nestedI18nItems: DirectorySelectionItem[] = [
  {
    directoryId: "dir-1",
    directoryName: "i18n",
    rootPath: rootPathA,
    relativePath: "",
    name: "i18n",
    type: "directory",
  },
  {
    directoryId: "dir-1",
    directoryName: "i18n",
    rootPath: rootPathA,
    relativePath: "resources",
    name: "resources",
    type: "directory",
  },
  {
    directoryId: "dir-1",
    directoryName: "i18n",
    rootPath: rootPathA,
    relativePath: "resources/en.json",
    name: "en.json",
    type: "file",
  },
  {
    directoryId: "dir-1",
    directoryName: "i18n",
    rootPath: rootPathA,
    relativePath: "resources/ja.json",
    name: "ja.json",
    type: "file",
  },
  {
    directoryId: "dir-1",
    directoryName: "i18n",
    rootPath: rootPathA,
    relativePath: "client.ts",
    name: "client.ts",
    type: "file",
  },
  {
    directoryId: "dir-1",
    directoryName: "i18n",
    rootPath: rootPathA,
    relativePath: "index.ts",
    name: "index.ts",
    type: "file",
  },
  {
    directoryId: "dir-2",
    directoryName: "lib",
    rootPath: rootPathLib,
    relativePath: "utils.ts",
    name: "utils.ts",
    type: "file",
  },
];

export function collidingI18nItems(): DirectorySelectionItem[] {
  return [
    ...nestedI18nItems.filter((item) => item.directoryId === "dir-1"),
    {
      directoryId: "dir-3",
      directoryName: "i18n",
      rootPath: rootPathB,
      relativePath: "",
      name: "i18n",
      type: "directory",
    },
    {
      directoryId: "dir-3",
      directoryName: "i18n",
      rootPath: rootPathB,
      relativePath: "client.ts",
      name: "client.ts",
      type: "file",
    },
  ];
}
