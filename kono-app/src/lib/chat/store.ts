import { create } from "zustand";
import {
  ActiveButton,
  Conversation,
  ConversationID,
  Section,
  StreamBuffer,
} from "./types";

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
  setStreaming: (buffer: Omit<StreamBuffer, "id"> | null) => void;
  streamBuffer: StreamBuffer | null;
  // TODO: chat caching
  // loadedMessages: Map<ConversationID, Conversation>;

  // Chat functions
  newChat: () => void;
  setConversation: (_c: Conversation) => void;
  addSection: (_id: ConversationID, _section: Section) => void;

  // Chat input
  activeButton: ActiveButton;
  setActiveButton: (
    _: ((_: ActiveButton) => ActiveButton) | ActiveButton
  ) => void;
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

  newChat: () => {
    set((_) => {
      // TODO: register with server
      const id = crypto.randomUUID() as ConversationID;

      console.debug("Creating new chat:", id);
      return {
        // currentChatId: id,
        currentConversation: {
          id,
          title: null,
          sections: [],
          lastUpdatedAt: null,
        } satisfies Conversation,
      };
    });
  },

  setStreaming: (buffer: Omit<StreamBuffer, "id"> | null) => {
    set(({ currentConversation }) => ({
      isStreaming: !!buffer,
      streamBuffer: buffer
        ? {
            id: currentConversation?.id ?? "",
            ...buffer,
          }
        : null,
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
        title: state.currentConversation?.title ?? null,
        sections: [...(state.currentConversation?.sections ?? []), section],
        lastUpdatedAt: new Date().getTime(),
      },
    }));
  },

  activeButton: "none",
  setActiveButton: (
    f: ((_prev: ActiveButton) => ActiveButton) | ActiveButton
  ) =>
    set(({ activeButton }) => ({
      activeButton: typeof f === "function" ? f(activeButton) : f,
    })),
}));
