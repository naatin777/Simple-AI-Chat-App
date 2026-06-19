import { create } from "zustand";

interface ConversationStore {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  reset: () => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  activeConversationId: null,
  setActiveConversationId: (id) => {
    set({ activeConversationId: id });
  },
  reset: () => {
    set({ activeConversationId: null });
  },
}));
