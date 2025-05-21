import { DEFAULT_MODEL, ModelId } from "@/lib/constants";
import { create } from "zustand";
import type {
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
  currentModel: ModelId;
  // currentChatId: ConversationID | null;
  currentConversation: Conversation | null;
  isStreaming: boolean;
  streamBuffer: StreamBuffer | null;
  // TODO: chat caching
  // loadedMessages: Map<ConversationID, Conversation>;

  // Chat functions
  setCurrentModel: (_: ModelId) => void;
  newChat: () => void;
  setStreaming: (
    _newBuffer: Partial<Omit<StreamBuffer, "id" | "lastUpdatedAt">> | null
  ) => void;
  setConversation: (_c: Conversation) => void;
  addSection: (_id: ConversationID, _section: Section) => void;
  setSection: (
    _id: ConversationID,
    _sectionId: string,
    _section: Partial<Omit<Section, "id" | "date" | "generationTime">>
  ) => void;
  setTitle: (_id: ConversationID, _title: string) => void;

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

  currentModel: DEFAULT_MODEL,
  currentChatId: null as ConversationID | null,
  currentConversation: null as Conversation | null,
  isStreaming: false,
  streamBuffer: null as StreamBuffer | null,

  setCurrentModel: (modelId: ModelId) => {
    set({ currentModel: modelId });
  },

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

  setStreaming: (
    newBuffer: Partial<Omit<StreamBuffer, "id" | "lastUpdatedAt">> | null
  ) => {
    set(({ currentConversation }) => ({
      isStreaming: !(!newBuffer || !!newBuffer?.error), // not streaming if no buffer or buffer has error
      streamBuffer: newBuffer
        ? {
            id: currentConversation?.id ?? "",
            messageId: newBuffer?.messageId ?? "",
            words: newBuffer?.words ?? [],
            lastUpdatedAt: new Date().getTime(),
            error: newBuffer?.error ?? null,
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

  setSection: (
    id: ConversationID,
    sectionId: string,
    section: Partial<Omit<Section, "id" | "date" | "generationTime">>
  ) => {
    set((state) => {
      // find the section in the current conversation
      const sections = state.currentConversation?.sections ?? [];
      const index = sections.findIndex((s) => s.id === sectionId);

      if (index === -1) {
        console.warn("Section not found:", sectionId);
        return {};
      }

      // update the section
      const updatedSections = [...sections];
      updatedSections[index] = {
        ...updatedSections[index],
        ...section, // overwrite defined properties
      };

      return {
        currentConversation: {
          id,
          title: state.currentConversation?.title ?? null,
          sections: updatedSections,
          lastUpdatedAt: new Date().getTime(),
        },
      };
    });
  },

  setTitle: (id: ConversationID, title: string) => {
    set(({ currentConversation }) => {
      if (!currentConversation) {
        console.warn("No current conversation to set title for.");
        return {};
      }

      return {
        currentConversation: {
          ...currentConversation,
          title,
        },
      };
    });
  },

  activeButton: "none",
  setActiveButton: (
    f: ((_prev: ActiveButton) => ActiveButton) | ActiveButton
  ) =>
    set(({ activeButton }) => ({
      activeButton: typeof f === "function" ? f(activeButton) : f,
    })),
}));
