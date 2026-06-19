"use client";

import {
  ChevronRightIcon,
  FolderRootIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { DirectoryCheckbox } from "@/components/directory-checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDirectorySelection } from "@/hooks/use-directory-selection";
import { useGetApiConversationsIdDirectoriesDirIdFiles } from "@/lib/api/generated/endpoints/directories/directories";
import { DirectoryFilesResponseSchema } from "@/lib/openapi/schemas/directory";
import { getResponseData } from "@/lib/api/response";
import {
  treeActionColumnClassName,
  treePadding,
  treeRowClassName,
} from "@/lib/directory-tree-layout";
import { cn } from "@/lib/utils";

type DirectoryRootRowProps = {
  conversationId: string;
  directory: {
    id: string;
    name: string;
    path: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
};

export function DirectoryRootRow({
  conversationId,
  directory,
  isExpanded,
  onToggle,
  onRemove,
}: DirectoryRootRowProps) {
  const { t } = useTranslation();
  const {
    getRootCheckboxState,
    setRootDirectoryFilesChecked,
    registerSubtreeFiles,
  } = useDirectorySelection();

  const { data: filesResponse } = useGetApiConversationsIdDirectoriesDirIdFiles(
    conversationId,
    directory.id,
    { relativePath: "" },
    { swr: { enabled: true } },
  );

  const subtreeFiles = useMemo(
    () =>
      getResponseData(filesResponse, DirectoryFilesResponseSchema)?.files ?? [],
    [filesResponse],
  );

  useEffect(() => {
    if (subtreeFiles.length === 0) {
      return;
    }

    registerSubtreeFiles(
      {
        directoryId: directory.id,
        directoryName: directory.name,
        rootPath: directory.path,
      },
      subtreeFiles,
    );
  }, [
    directory.id,
    directory.name,
    directory.path,
    registerSubtreeFiles,
    subtreeFiles,
  ]);

  const rootState = getRootCheckboxState(directory.id);

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full">
        <div
          className={cn(
            treeRowClassName,
            "rounded-md text-sidebar-foreground hover:bg-sidebar-accent",
          )}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onToggle}
                  className="flex h-7 min-w-0 flex-1 items-center gap-1 text-left text-sm"
                  style={{ paddingLeft: treePadding(0) }}
                >
                  <ChevronRightIcon
                    className={cn(
                      "size-3.5 shrink-0 text-muted-foreground transition-transform",
                      isExpanded && "rotate-90",
                    )}
                  />
                  <FolderRootIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium">{directory.name}</span>
                </button>
              }
            />
            <TooltipContent side="left" className="max-w-sm break-all">
              {directory.path}
            </TooltipContent>
          </Tooltip>
          <div className={treeActionColumnClassName}>
            <DirectoryCheckbox
              checked={rootState}
              onCheckedChange={(checked) => {
                setRootDirectoryFilesChecked(directory.id, checked);
              }}
              aria-label={directory.name}
            />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44">
        <ContextMenuItem
          variant="destructive"
          onClick={() => {
            onRemove();
          }}
        >
          <Trash2Icon />
          {t("directory.remove")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
