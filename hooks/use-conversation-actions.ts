"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { mutate } from "swr";

import {
  deleteApiConversationsId,
  getGetApiConversationsKey,
  patchApiConversationsId,
  postApiConversations,
  postApiConversationsIdDuplicate,
  postApiConversationsIdDuplicateDirectories,
  usePostApiConversations,
} from "@/lib/api/generated/endpoints/conversations/conversations";
import {
  ConversationListSchema,
  ConversationSchema,
} from "@/lib/openapi/schemas/conversation";
import { getResponseData } from "@/lib/api/response";
import { useConversationStore } from "@/stores/conversation-store";

export function useConversationActions() {
  const { t } = useTranslation();
  const setActiveConversationId = useConversationStore(
    (state) => state.setActiveConversationId,
  );
  const { trigger: createConversationMutation } = usePostApiConversations();

  const refreshConversations = useCallback(async () => {
    await mutate(getGetApiConversationsKey());
  }, []);

  const createConversation = useCallback(async () => {
    const response = await createConversationMutation({
      title: t("conversation.defaultTitle"),
    });
    const conversation = getResponseData(response, ConversationSchema);
    if (!conversation) {
      return null;
    }

    await refreshConversations();
    setActiveConversationId(conversation.id);
    return conversation;
  }, [createConversationMutation, refreshConversations, setActiveConversationId, t]);

  const renameConversation = useCallback(
    async (conversationId: string, title: string) => {
      const response = await patchApiConversationsId(conversationId, { title });
      const conversation = getResponseData(response, ConversationSchema);
      if (!conversation) {
        return false;
      }

      await refreshConversations();
      return true;
    },
    [refreshConversations],
  );

  const deleteConversation = useCallback(
    async (conversationId: string, conversations: { id: string }[]) => {
      const wasActive =
        useConversationStore.getState().activeConversationId === conversationId;
      const remaining = conversations.filter(
        (conversation) => conversation.id !== conversationId,
      );

      await mutate(
        getGetApiConversationsKey(),
        (current) => {
          const currentList = getResponseData(current, ConversationListSchema);
          if (!current || !currentList) {
            return current;
          }

          return {
            ...current,
            data: currentList.filter(
              (conversation) => conversation.id !== conversationId,
            ),
          };
        },
        { revalidate: false },
      );

      if (wasActive) {
        setActiveConversationId(remaining[0]?.id ?? null);
      }

      await deleteApiConversationsId(conversationId);
      await refreshConversations();
    },
    [refreshConversations, setActiveConversationId],
  );

  const pinConversation = useCallback(
    async (conversationId: string, pinned: boolean) => {
      await patchApiConversationsId(conversationId, { pinned });
      await refreshConversations();
    },
    [refreshConversations],
  );

  const duplicateConversation = useCallback(
    async (conversationId: string) => {
      const response = await postApiConversationsIdDuplicate(conversationId);
      const conversation = getResponseData(response, ConversationSchema);
      if (!conversation) {
        return;
      }

      await refreshConversations();
      setActiveConversationId(conversation.id);
    },
    [refreshConversations, setActiveConversationId],
  );

  const duplicateConversationDirectories = useCallback(
    async (conversationId: string) => {
      const response =
        await postApiConversationsIdDuplicateDirectories(conversationId);
      const conversation = getResponseData(response, ConversationSchema);
      if (!conversation) {
        return;
      }

      await refreshConversations();
      setActiveConversationId(conversation.id);
    },
    [refreshConversations, setActiveConversationId],
  );

  const resetAllData = useCallback(async () => {
    const response = await fetch("/api/admin/reset", { method: "POST" });

    if (!response.ok) {
      return false;
    }

    setActiveConversationId(null);
    await refreshConversations();
    return true;
  }, [refreshConversations, setActiveConversationId]);

  const createEmptyConversation = useCallback(async () => {
    const response = await postApiConversations({});
    const conversation = getResponseData(response, ConversationSchema);
    if (!conversation) {
      return null;
    }

    await refreshConversations();
    setActiveConversationId(conversation.id);
    return conversation;
  }, [refreshConversations, setActiveConversationId]);

  return {
    createConversation,
    createEmptyConversation,
    resetAllData,
    refreshConversations,
    renameConversation,
    deleteConversation,
    pinConversation,
    duplicateConversation,
    duplicateConversationDirectories,
  };
}
