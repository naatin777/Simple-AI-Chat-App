"use client";

import { FolderPlusIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { mutate } from "swr";

import { DirectoryRootRow } from "@/components/directory-root-row";
import { DirectoryTree } from "@/components/directory-tree";
import { RightSidebar } from "@/components/right-sidebar-provider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDirectorySelection } from "@/hooks/use-directory-selection";
import {
  deleteApiConversationsIdDirectoriesDirId,
  getGetApiConversationsIdDirectoriesKey,
  useGetApiConversationsIdDirectories,
  usePostApiConversationsIdDirectories,
  usePostApiDirectoriesPick,
} from "@/lib/api/generated/endpoints/directories/directories";
import {
  ConversationDirectoryListSchema,
  PickedDirectorySchema,
} from "@/lib/openapi/schemas/directory";
import { getResponseData } from "@/lib/api/response";
import { useDirectoryUiStore } from "@/stores/directory-ui-store";

type DirectorySidebarProps = {
  conversationId: string | null;
  isLoading: boolean;
};

export function DirectorySidebar({
  conversationId,
  isLoading,
}: DirectorySidebarProps) {
  const { t } = useTranslation();
  const { registerItem, unregisterDirectory } = useDirectorySelection();
  const expandedDirectoryIds = useDirectoryUiStore(
    (state) => state.expandedDirectoryIds,
  );
  const setExpandedDirectoryIds = useDirectoryUiStore(
    (state) => state.setExpandedDirectoryIds,
  );
  const toggleDirectory = useDirectoryUiStore((state) => state.toggleDirectory);
  const removeExpandedDirectory = useDirectoryUiStore(
    (state) => state.removeExpandedDirectory,
  );

  const { data: directoriesResponse, isLoading: isLoadingDirectories } =
    useGetApiConversationsIdDirectories(conversationId ?? "", {
      swr: { enabled: Boolean(conversationId) },
    });

  const directories = useMemo(
    () =>
      getResponseData(directoriesResponse, ConversationDirectoryListSchema) ??
      [],
    [directoriesResponse],
  );

  const { trigger: pickDirectory, isMutating: isPicking } =
    usePostApiDirectoriesPick();
  const { trigger: addDirectoryMutation, isMutating: isAddingDirectory } =
    usePostApiConversationsIdDirectories(conversationId ?? "");

  useEffect(() => {
    if (!conversationId || directories.length === 0) {
      return;
    }

    setExpandedDirectoryIds(new Set(directories.map((directory) => directory.id)));
  }, [conversationId, directories, setExpandedDirectoryIds]);

  useEffect(() => {
    for (const directory of directories) {
      registerItem({
        directoryId: directory.id,
        directoryName: directory.name,
        rootPath: directory.path,
        relativePath: "",
        name: directory.name,
        type: "directory",
      });
    }
  }, [directories, registerItem]);

  async function addDirectory() {
    if (!conversationId || isPicking || isAddingDirectory) {
      return;
    }

    const pickResponse = await pickDirectory();
    if (!pickResponse || pickResponse.status === 204) {
      return;
    }

    const picked = getResponseData(pickResponse, PickedDirectorySchema);
    if (!picked) {
      return;
    }

    try {
      await addDirectoryMutation({ path: picked.path });
      await mutate(getGetApiConversationsIdDirectoriesKey(conversationId));
    } catch {
      return;
    }
  }

  async function removeDirectory(directoryId: string) {
    if (!conversationId) {
      return;
    }

    try {
      await deleteApiConversationsIdDirectoriesDirId(
        conversationId,
        directoryId,
      );
      unregisterDirectory(directoryId);
      removeExpandedDirectory(directoryId);
      await mutate(getGetApiConversationsIdDirectoriesKey(conversationId));
    } catch {
      return;
    }
  }

  return (
    <RightSidebar>
      <div className="shrink-0 border-b border-sidebar-border p-4">
        <Button
          className="w-full justify-start gap-2"
          onClick={() => {
            void addDirectory();
          }}
          disabled={
            isLoading || !conversationId || isPicking || isAddingDirectory
          }
        >
          <FolderPlusIcon className="size-4" />
          {t("directory.add")}
        </Button>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
            {t("directory.list")}
          </p>
          {!conversationId || isLoadingDirectories ? (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              {t("directory.loading")}
            </p>
          ) : directories.length === 0 ? (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              {t("directory.empty")}
            </p>
          ) : (
            directories.map((directory) => {
              const isExpanded = expandedDirectoryIds.has(directory.id);

              return (
                <div key={directory.id}>
                  <DirectoryRootRow
                    conversationId={conversationId}
                    directory={directory}
                    isExpanded={isExpanded}
                    onToggle={() => {
                      toggleDirectory(directory.id);
                    }}
                    onRemove={() => {
                      void removeDirectory(directory.id);
                    }}
                  />
                  {isExpanded && conversationId ? (
                    <DirectoryTree
                      conversationId={conversationId}
                      directoryId={directory.id}
                      directoryName={directory.name}
                      rootPath={directory.path}
                      depth={1}
                    />
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </RightSidebar>
  );
}
