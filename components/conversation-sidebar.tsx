"use client";

import {
  CopyIcon,
  FolderInputIcon,
  MessageSquarePlusIcon,
  MoreHorizontalIcon,
  PinIcon,
  PinOffIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Conversation } from "@/lib/openapi/schemas/conversation";

type ConversationSidebarProps = {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onRenameConversation: (id: string, title: string) => Promise<boolean>;
  onDeleteConversation: (id: string) => Promise<void>;
  onPinConversation: (id: string, pinned: boolean) => Promise<void>;
  onDuplicateConversation: (id: string) => Promise<void>;
  onDuplicateConversationDirectories: (id: string) => Promise<void>;
};

type ConversationMenuItemsProps = {
  conversation: Conversation;
  onRename: () => void;
  onDelete: () => void;
  onPin: () => void;
  onDuplicate: () => void;
  onDuplicateDirectories: () => void;
  MenuItem: typeof DropdownMenuItem | typeof ContextMenuItem;
  Separator: typeof DropdownMenuSeparator | typeof ContextMenuSeparator;
};

function ConversationMenuItems({
  conversation,
  onRename,
  onDelete,
  onPin,
  onDuplicate,
  onDuplicateDirectories,
  MenuItem,
  Separator,
}: ConversationMenuItemsProps) {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem onClick={onRename}>
        <PencilIcon />
        {t("conversation.rename")}
      </MenuItem>
      <MenuItem onClick={onPin}>
        {conversation.pinned ? <PinOffIcon /> : <PinIcon />}
        {conversation.pinned
          ? t("conversation.unpin")
          : t("conversation.pin")}
      </MenuItem>
      <MenuItem onClick={onDuplicate}>
        <CopyIcon />
        {t("conversation.duplicate")}
      </MenuItem>
      <MenuItem onClick={onDuplicateDirectories}>
        <FolderInputIcon />
        {t("conversation.duplicateDirectories")}
      </MenuItem>
      <Separator />
      <MenuItem variant="destructive" onClick={onDelete}>
        <Trash2Icon />
        {t("conversation.delete")}
      </MenuItem>
    </>
  );
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  isLoading,
  onSelectConversation,
  onCreateConversation,
  onRenameConversation,
  onDeleteConversation,
  onPinConversation,
  onDuplicateConversation,
  onDuplicateConversationDirectories,
}: ConversationSidebarProps) {
  const { t } = useTranslation();
  const [renamingConversation, setRenamingConversation] =
    useState<Conversation | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [deletingConversation, setDeletingConversation] =
    useState<Conversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openRenameDialog(conversation: Conversation) {
    setRenamingConversation(conversation);
    setRenameDraft(conversation.title);
  }

  async function submitRename() {
    if (!renamingConversation || isRenaming) return;

    const trimmedTitle = renameDraft.trim();
    if (!trimmedTitle) return;

    setIsRenaming(true);
    const success = await onRenameConversation(
      renamingConversation.id,
      trimmedTitle,
    );
    setIsRenaming(false);

    if (success) {
      setRenamingConversation(null);
    }
  }

  async function submitDelete() {
    if (!deletingConversation || isDeleting) return;

    setIsDeleting(true);
    await onDeleteConversation(deletingConversation.id);
    setIsDeleting(false);
    setDeletingConversation(null);
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <Button
            className="w-full justify-start gap-2"
            onClick={onCreateConversation}
            disabled={isLoading}
          >
            <MessageSquarePlusIcon className="size-4" />
            {t("sidebar.newConversation")}
          </Button>
        </SidebarHeader>
        <SidebarContent className="overflow-hidden">
          <SidebarGroup className="flex min-h-0 flex-1 flex-col !pr-0">
            <SidebarGroupLabel>{t("sidebar.conversationList")}</SidebarGroupLabel>
            <SidebarGroupContent className="min-h-0 flex-1">
              <ScrollArea className="h-full min-h-0 [&_[data-slot=scroll-area-viewport]]:overflow-x-hidden [&_[data-slot=scroll-area-viewport]]:pr-2">
                <SidebarMenu>
                  {conversations.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      {t("sidebar.noConversations")}
                    </p>
                  ) : null}
                  {conversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <ContextMenu>
                        <ContextMenuTrigger className="relative block w-full">
                          <SidebarMenuButton
                            isActive={
                              conversation.id === activeConversationId
                            }
                            onClick={() =>
                              onSelectConversation(conversation.id)
                            }
                            className="h-auto min-h-9 py-2 !pr-7"
                          >
                            <span className="flex min-w-0 items-start gap-1.5 text-left">
                              {conversation.pinned ? (
                                <PinIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                              ) : null}
                              <span className="line-clamp-2">
                                {conversation.title}
                              </span>
                            </span>
                          </SidebarMenuButton>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <SidebarMenuAction showOnHover />
                              }
                              onClick={(event) => event.stopPropagation()}
                            >
                              <MoreHorizontalIcon />
                              <span className="sr-only">
                                {t("sidebar.openMenu")}
                              </span>
                            </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                side="bottom"
                                className="w-44"
                              >
                                <ConversationMenuItems
                                  conversation={conversation}
                                  onRename={() =>
                                    openRenameDialog(conversation)
                                  }
                                  onDelete={() =>
                                    setDeletingConversation(conversation)
                                  }
                                  onPin={() =>
                                    void onPinConversation(
                                      conversation.id,
                                      !conversation.pinned,
                                    )
                                  }
                                  onDuplicate={() =>
                                    void onDuplicateConversation(
                                      conversation.id,
                                    )
                                  }
                                  onDuplicateDirectories={() =>
                                    void onDuplicateConversationDirectories(
                                      conversation.id,
                                    )
                                  }
                                  MenuItem={DropdownMenuItem}
                                  Separator={DropdownMenuSeparator}
                                />
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-44">
                          <ConversationMenuItems
                            conversation={conversation}
                            onRename={() => openRenameDialog(conversation)}
                            onDelete={() =>
                              setDeletingConversation(conversation)
                            }
                            onPin={() =>
                              void onPinConversation(
                                conversation.id,
                                !conversation.pinned,
                              )
                            }
                            onDuplicate={() =>
                              void onDuplicateConversation(conversation.id)
                            }
                            onDuplicateDirectories={() =>
                              void onDuplicateConversationDirectories(
                                conversation.id,
                              )
                            }
                            MenuItem={ContextMenuItem}
                            Separator={ContextMenuSeparator}
                          />
                        </ContextMenuContent>
                      </ContextMenu>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <Dialog
        open={renamingConversation !== null}
        onOpenChange={(open) => {
          if (!open) setRenamingConversation(null);
        }}
      >
        <DialogContent showCloseButton={!isRenaming}>
          <DialogHeader>
            <DialogTitle>{t("conversation.renameTitle")}</DialogTitle>
            <DialogDescription>
              {t("conversation.renameDescription")}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameDraft}
            onChange={(event) => setRenameDraft(event.target.value)}
            disabled={isRenaming}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void submitRename();
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenamingConversation(null)}
              disabled={isRenaming}
            >
              {t("conversation.cancel")}
            </Button>
            <Button
              onClick={() => void submitRename()}
              disabled={isRenaming || !renameDraft.trim()}
            >
              {t("conversation.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deletingConversation !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingConversation(null);
        }}
      >
        <DialogContent showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle>{t("conversation.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("conversation.deleteDescription", {
                title: deletingConversation?.title,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingConversation(null)}
              disabled={isDeleting}
            >
              {t("conversation.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => void submitDelete()}
              disabled={isDeleting}
            >
              {t("conversation.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
