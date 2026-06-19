"use client";

import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  Loader2Icon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { DirectoryCheckbox } from "@/components/directory-checkbox";
import { useDirectorySelection } from "@/hooks/use-directory-selection";
import { useFilePreview } from "@/hooks/use-file-preview";
import {
  useGetApiConversationsIdDirectoriesDirIdFiles,
  useGetApiConversationsIdDirectoriesDirIdTree,
} from "@/lib/api/generated/endpoints/directories/directories";
import {
  DirectoryFilesResponseSchema,
  DirectoryTreeResponseSchema,
  type DirectoryTreeNode,
} from "@/lib/openapi/schemas/directory";
import { getResponseData } from "@/lib/api/response";
import {
  getDirectoryCheckedState,
  selectionItemKey,
  type DirectorySelectionItem,
} from "@/lib/directory-selection";
import {
  treeActionColumnClassName,
  treeLabelButtonClassName,
  treePadding,
  treeRowClassName,
} from "@/lib/directory-tree-layout";
import { cn } from "@/lib/utils";

export { treePadding } from "@/lib/directory-tree-layout";

type DirectoryTreeProps = {
  conversationId: string;
  directoryId: string;
  directoryName: string;
  rootPath: string;
  relativePath?: string;
  depth?: number;
};

type DirectoryTreeItemProps = {
  conversationId: string;
  directoryId: string;
  directoryName: string;
  rootPath: string;
  node: DirectoryTreeNode;
  depth: number;
};

function DirectoryTreeItem({
  conversationId,
  directoryId,
  directoryName,
  rootPath,
  node,
  depth,
}: DirectoryTreeItemProps) {
  const { t } = useTranslation();
  const {
    items,
    checkedFileKeys,
    registerItem,
    registerSubtreeFiles,
    isFileChecked,
    setFileChecked,
    setDirectoryFilesChecked,
  } = useDirectorySelection();
  const { openFile } = useFilePreview();
  const [expanded, setExpanded] = useState(false);

  const selectionItem: DirectorySelectionItem = {
    directoryId,
    directoryName,
    rootPath,
    relativePath: node.path,
    name: node.name,
    type: node.type,
  };

  useEffect(() => {
    registerItem({
      directoryId,
      directoryName,
      rootPath,
      relativePath: node.path,
      name: node.name,
      type: node.type,
    });
  }, [
    directoryId,
    directoryName,
    rootPath,
    node.path,
    node.name,
    node.type,
    registerItem,
  ]);

  const { data: filesResponse } = useGetApiConversationsIdDirectoriesDirIdFiles(
    conversationId,
    directoryId,
    { relativePath: node.path },
    { swr: { enabled: node.type === "directory" } },
  );

  const subtreeFiles = useMemo(
    () =>
      getResponseData(filesResponse, DirectoryFilesResponseSchema)?.files ?? [],
    [filesResponse],
  );

  useEffect(() => {
    if (node.type !== "directory" || subtreeFiles.length === 0) {
      return;
    }

    registerSubtreeFiles(
      { directoryId, directoryName, rootPath },
      subtreeFiles,
    );
  }, [
    directoryId,
    directoryName,
    node.type,
    registerSubtreeFiles,
    rootPath,
    subtreeFiles,
  ]);

  const { data: treeResponse, isLoading, error } =
    useGetApiConversationsIdDirectoriesDirIdTree(
      conversationId,
      directoryId,
      { relativePath: node.path },
      { swr: { enabled: expanded && node.type === "directory" } },
    );

  const children =
    getResponseData(treeResponse, DirectoryTreeResponseSchema)?.nodes ?? [];

  if (node.type === "file") {
    const fileKey = selectionItemKey(selectionItem);

    return (
      <div
        className={cn(
          treeRowClassName,
          "rounded-md text-sidebar-foreground hover:bg-sidebar-accent",
        )}
      >
        <div
          className="flex min-w-0 flex-1 items-center overflow-hidden"
          style={{ paddingLeft: treePadding(depth) }}
        >
          <button
            type="button"
            onClick={() => {
              openFile({
                directoryId,
                relativePath: node.path,
                name: node.name,
              });
            }}
            className={treeLabelButtonClassName}
          >
            <span className="inline-flex size-3.5 shrink-0" aria-hidden />
            <FileIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{node.name}</span>
          </button>
        </div>
        <div className={treeActionColumnClassName}>
          <DirectoryCheckbox
            checked={isFileChecked(selectionItem)}
            onCheckedChange={(checked) => {
              setFileChecked(fileKey, checked);
            }}
            aria-label={node.name}
          />
        </div>
      </div>
    );
  }

  const directoryState = getDirectoryCheckedState(
    items,
    selectionItem,
    checkedFileKeys,
  );

  return (
    <div>
      <div
        className={cn(treeRowClassName, "rounded-md hover:bg-sidebar-accent")}
      >
        <div
          className="flex min-w-0 flex-1 items-center overflow-hidden"
          style={{ paddingLeft: treePadding(depth) }}
        >
          <button
            type="button"
            onClick={() => {
              setExpanded((current) => !current);
            }}
            className={treeLabelButtonClassName}
          >
            <ChevronRightIcon
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-90",
              )}
            />
            <FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{node.name}</span>
            {isLoading ? (
              <Loader2Icon className="ml-1 size-3.5 shrink-0 animate-spin text-muted-foreground" />
            ) : null}
          </button>
        </div>
        <div className={treeActionColumnClassName}>
          <DirectoryCheckbox
            checked={directoryState}
            onCheckedChange={(checked) => {
              setDirectoryFilesChecked(selectionItem, checked);
            }}
            aria-label={node.name}
          />
        </div>
      </div>
      {error ? (
        <p
          className="h-7 py-1 text-xs text-destructive"
          style={{ paddingLeft: treePadding(depth + 1) }}
        >
          {t("directory.error")}
        </p>
      ) : null}
      {expanded
        ? children.map((child) => (
            <DirectoryTreeItem
              key={child.path}
              conversationId={conversationId}
              directoryId={directoryId}
              directoryName={directoryName}
              rootPath={rootPath}
              node={child}
              depth={depth + 1}
            />
          ))
        : null}
    </div>
  );
}

export function DirectoryTree({
  conversationId,
  directoryId,
  directoryName,
  rootPath,
  relativePath = "",
  depth = 1,
}: DirectoryTreeProps) {
  const { t } = useTranslation();
  const { registerItem, registerSubtreeFiles } = useDirectorySelection();

  const { data: rootFilesResponse } =
    useGetApiConversationsIdDirectoriesDirIdFiles(
      conversationId,
      directoryId,
      { relativePath },
      { swr: { enabled: true } },
    );

  const rootSubtreeFiles = useMemo(
    () =>
      getResponseData(rootFilesResponse, DirectoryFilesResponseSchema)?.files ??
      [],
    [rootFilesResponse],
  );

  useEffect(() => {
    if (rootSubtreeFiles.length === 0) {
      return;
    }

    registerSubtreeFiles(
      { directoryId, directoryName, rootPath },
      rootSubtreeFiles,
    );
  }, [
    directoryId,
    directoryName,
    registerSubtreeFiles,
    rootPath,
    rootSubtreeFiles,
  ]);

  const { data: treeResponse, isLoading, error } =
    useGetApiConversationsIdDirectoriesDirIdTree(
      conversationId,
      directoryId,
      { relativePath },
      { swr: { enabled: true } },
    );

  const nodes =
    getResponseData(treeResponse, DirectoryTreeResponseSchema)?.nodes ?? [];

  useEffect(() => {
    registerItem({
      directoryId,
      directoryName,
      rootPath,
      relativePath: "",
      name: directoryName,
      type: "directory",
    });
  }, [directoryId, directoryName, rootPath, registerItem]);

  if (isLoading) {
    return (
      <div
        className={cn(treeRowClassName, "text-xs text-muted-foreground")}
        style={{ paddingLeft: treePadding(depth) }}
      >
        <Loader2Icon className="size-3.5 animate-spin" />
        {t("directory.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <p
        className="flex h-7 items-center text-xs text-destructive"
        style={{ paddingLeft: treePadding(depth) }}
      >
        {t("directory.error")}
      </p>
    );
  }

  return (
    <>
      {nodes.map((node) => (
        <DirectoryTreeItem
          key={node.path}
          conversationId={conversationId}
          directoryId={directoryId}
          directoryName={directoryName}
          rootPath={rootPath}
          node={node}
          depth={depth}
        />
      ))}
    </>
  );
}
