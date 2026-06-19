"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import type { UIMessage } from "ai";
import { useTranslation } from "react-i18next";

import { Chat } from "@/components/chat";
import { ConversationSidebar } from "@/components/conversation-sidebar";
import { ConversationTitle } from "@/components/conversation-title";
import { DirectorySidebar } from "@/components/directory-sidebar";
import { FilePreviewOverlay } from "@/components/file-preview-overlay";
import { RightSidebarProvider } from "@/components/right-sidebar-provider";
import { RightSidebarTrigger } from "@/components/right-sidebar-trigger";
import { SettingsButton } from "@/components/settings-dialog";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useConversationActions } from "@/hooks/use-conversation-actions";
import { useConversationReset } from "@/hooks/use-conversation-reset";
import { useGetApiConversations } from "@/lib/api/generated/endpoints/conversations/conversations";
import { useGetApiConversationsIdMessages } from "@/lib/api/generated/endpoints/messages/messages";
import { ConversationListSchema } from "@/lib/openapi/schemas/conversation";
import {
  StoredMessageListSchema,
  type StoredMessage,
} from "@/lib/openapi/schemas/message";
import { getResponseData } from "@/lib/api/response";
import { useConversationStore } from "@/stores/conversation-store";
import { useSidebarLayoutStore } from "@/stores/sidebar-layout-store";

function toUIMessages(storedMessages: StoredMessage[]): UIMessage[] {
  return storedMessages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: [{ type: "text" as const, text: message.content }],
  }));
}

type ChatAppProps = {
  webSearchAvailable?: boolean;
};

export function ChatApp({ webSearchAvailable = false }: ChatAppProps) {
  const { t } = useTranslation();
  useConversationReset();

  const activeConversationId = useConversationStore(
    (state) => state.activeConversationId,
  );
  const setActiveConversationId = useConversationStore(
    (state) => state.setActiveConversationId,
  );

  const {
    data: conversationsResponse,
    isLoading,
    mutate: mutateConversations,
  } = useGetApiConversations();

  const conversations = useMemo(
    () =>
      getResponseData(conversationsResponse, ConversationListSchema) ?? [],
    [conversationsResponse],
  );

  const { data: messagesResponse } = useGetApiConversationsIdMessages(
    activeConversationId ?? "",
    { swr: { enabled: Boolean(activeConversationId) } },
  );

  const initialMessages = useMemo(
    () =>
      toUIMessages(
        getResponseData(messagesResponse, StoredMessageListSchema) ?? [],
      ),
    [messagesResponse],
  );

  const {
    createConversation,
    createEmptyConversation,
    refreshConversations,
    renameConversation,
    deleteConversation,
    pinConversation,
    duplicateConversation,
    duplicateConversationDirectories,
    resetAllData,
  } = useConversationActions();

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  );
  const leftWidthPx = useSidebarLayoutStore((state) => state.leftWidthPx);
  const isEnsuringConversation = useRef(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (conversations.length === 0) {
      if (isEnsuringConversation.current) {
        return;
      }

      isEnsuringConversation.current = true;
      void createEmptyConversation().finally(() => {
        isEnsuringConversation.current = false;
      });
      return;
    }

    if (
      !activeConversationId ||
      !conversations.some(
        (conversation) => conversation.id === activeConversationId,
      )
    ) {
      setActiveConversationId(conversations[0].id);
    }
  }, [
    activeConversationId,
    conversations,
    createEmptyConversation,
    isLoading,
    setActiveConversationId,
  ]);

  const updateConversationTitle = (conversationId: string, title: string) => {
    void mutateConversations(
      (current) => {
        const currentList = getResponseData(current, ConversationListSchema);
        if (!current || !currentList) {
          return current;
        }

        return {
          ...current,
          data: currentList.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, title }
              : conversation,
          ),
        };
      },
      { revalidate: false },
    );
  };

  return (
    <SidebarProvider
      className="h-svh min-h-0 overflow-hidden"
      style={
        {
          "--sidebar-width": `${leftWidthPx}px`,
        } as CSSProperties
      }
    >
      <RightSidebarProvider>
        <ConversationSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          isLoading={isLoading}
          onSelectConversation={(id) => {
            setActiveConversationId(id);
          }}
          onCreateConversation={() => {
            void createConversation();
          }}
          onRenameConversation={renameConversation}
          onDeleteConversation={async (conversationId) => {
            await deleteConversation(conversationId, conversations);
          }}
          onPinConversation={async (conversationId, pinned) => {
            await pinConversation(conversationId, pinned);
          }}
          onDuplicateConversation={async (conversationId) => {
            await duplicateConversation(conversationId);
          }}
          onDuplicateConversationDirectories={async (conversationId) => {
            await duplicateConversationDirectories(conversationId);
          }}
        />
        <SidebarInset className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <ConversationTitle
              conversationId={activeConversationId}
              title={activeConversation?.title ?? t("app.title")}
              onTitleChange={updateConversationTitle}
            />
            <div className="ml-auto flex items-center gap-1">
              <RightSidebarTrigger />
              <SettingsButton onResetAllData={resetAllData} />
            </div>
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
              {activeConversationId ? (
                <>
                  <Chat
                    key={activeConversationId}
                    conversationId={activeConversationId}
                    initialMessages={initialMessages}
                    onConversationUpdated={refreshConversations}
                    webSearchAvailable={webSearchAvailable}
                  />
                  <FilePreviewOverlay conversationId={activeConversationId} />
                </>
              ) : null}
            </div>
          </div>
        </SidebarInset>
        <DirectorySidebar
          conversationId={activeConversationId}
          isLoading={isLoading}
        />
      </RightSidebarProvider>
    </SidebarProvider>
  );
}
