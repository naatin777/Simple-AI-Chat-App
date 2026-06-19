"use client";

import { useEffect } from "react";

import { useConversationStore } from "@/stores/conversation-store";
import { useDirectorySelectionStore } from "@/stores/directory-selection-store";
import { useDirectoryUiStore } from "@/stores/directory-ui-store";
import { useFilePreviewStore } from "@/stores/file-preview-store";

export function useConversationReset() {
  const activeConversationId = useConversationStore(
    (state) => state.activeConversationId,
  );

  useEffect(() => {
    useDirectorySelectionStore.getState().reset();
    useFilePreviewStore.getState().reset();
    useDirectoryUiStore.getState().reset();
  }, [activeConversationId]);
}
