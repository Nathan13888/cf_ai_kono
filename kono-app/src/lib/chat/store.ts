import { create } from "zustand";
import { Conversation, ConversationID, Section, StreamBuffer } from "./types";

interface ChatsState {
  // Page layout
  isMobile: boolean | null;
  viewportHeight: number;
  setIsMobile: (_: boolean) => void;
  setViewportHeight: (_: number) => void;

  // Local chat information
  // currentChatId: ConversationID | null;
  currentConversation: Conversation | null;
  isStreaming: boolean;
  streamBuffer: StreamBuffer | null;
  // TODO: chat caching
  // loadedMessages: Map<ConversationID, Conversation>;

  newChat: (_id: ConversationID) => void;
  setConversation: (_c: Conversation) => void;
  addSection: (_id: ConversationID, _section: Section) => void;
}

export const useChatsStore = create<ChatsState>((set) => ({
  isMobile: null,
  viewportHeight: 0,
  setIsMobile: (isMobile: boolean) => {
    set({ isMobile });
  },
  setViewportHeight: (vh: number) => {
    set({ viewportHeight: vh });
  },

  currentChatId: null as ConversationID | null,
  currentConversation: null as Conversation | null,
  isStreaming: false,
  streamBuffer: null as StreamBuffer | null,
  // loadedMessages: new Map<ConversationID, Conversation>(),

  newChat: (id: ConversationID) => {
    set((_) => ({
      // currentChatId: id,
      currentConversation: {
        id,
        sections: [],
        lastUpdatedAt: null,
      } satisfies Conversation,
    }));
  },

  setConversation: (conversation: Conversation) => {
    // set({ currentChatId: id });

    // TODO: fetch messages from server
    set({ currentConversation: conversation });
  },

  addSection: (id: ConversationID, section: Section) => {
    set((state) => ({
      currentConversation: {
        id,
        sections: [...(state.currentConversation?.sections ?? []), section],
        lastUpdatedAt: new Date().getTime(),
      },
    }));
  },
}));
