import { DEFAULT_MODEL, type ModelId } from "@/lib/constants";
import { create } from "zustand";
import type {
    ActiveButton
} from "./types";

// TODO: refactor name
interface ChatsState {
  // // Page layout
  // isMobile: boolean | null;
  // viewportHeight: number;
  // setIsMobile: (_: boolean) => void;
  // setViewportHeight: (_: number) => void;

  // UI States
  currentModel: ModelId;
  setCurrentModel: (id: ModelId) => void;
  activeButton: ActiveButton;
  setActiveButton: (
    _: ((_: ActiveButton) => ActiveButton) | ActiveButton
  ) => void;
  newChatMessage: string;
  setNewChatMessage: (message: string) => void;

  // activeChats: Map<ChatId, ActiveChatWithoutId>,
  // getActiveChat: (chatId: ChatId) => Promise<ActiveChat | undefined>,

  // streamBuffer: StreamBuffer | null;
  // TODO: chat caching
  // loadedMessages: Map<ChatId, Chat>;

  // // Chat functions
  // // setStreaming: (
  // //   _newBuffer: Partial<Omit<StreamBuffer, "id" | "lastUpdatedAt">> | null
  // // ) => void;

  // addSection: (_id: ChatId, _section: Section) => void;
  // setSection: (
  //   _id: ChatId,
  //   _sectionId: string,
  //   _f: (_section: Section) => Partial<Omit<Section, "id" | "createdAt">>
  // ) => void;
  // setTitle: (_id: ChatId, _title: string) => void;
}

export const useChatsStore = create<ChatsState>((set, get) => ({
  // isMobile: null,
  // viewportHeight: 0,
  // setIsMobile: (isMobile: boolean) => {
  //   set({ isMobile });
  // },
  // setViewportHeight: (vh: number) => {
  //   set({ viewportHeight: vh });
  // },

  currentModel: DEFAULT_MODEL, // TODO: persistence. Fetch from local storage in the future
  setCurrentModel: (id: ModelId) => {
    set({ currentModel: id });
  },
  activeButton: "none",
  setActiveButton: (
    f: ((_prev: ActiveButton) => ActiveButton) | ActiveButton
  ) =>
    set(({ activeButton }) => ({
      activeButton: typeof f === "function" ? f(activeButton) : f,
    })), // TODO: Check why there is a single active button
  newChatMessage: "",
  setNewChatMessage: (message: string) => 
    set({ newChatMessage: message }),

  // activeChats: new Map(),
  // getActiveChat: async (chatId: ChatId) => {
  //   const state = get();
  //   // const activeChatWithoutId = state.activeChats.get(chatId);
  //   // TODO: Attempt to use reactive state first

  //   const response = await client.chat[':id'].$get({
  //     param: {
  //       id: chatId,
  //     },
  //   })
  //   if (!response.ok) {
  //     console.error(`Failed to fetch chat "${chatId}"`, await response.text());
  //     return undefined;
  //   }

  //   try {
  //     const chat = Value.Parse(chatSchema, await response.json());
  //     // const activeChat
  //   } catch (e) {
  //     console.error(`Failed to parse chat "${chatId}"`, e);
  //   }
  // }


  // streamBuffer: null as StreamBuffer | null,
  // // setStreaming: (
  // //   newBuffer: Partial<Omit<StreamBuffer, "id" | "lastUpdatedAt">> | null
  // // ) => {
  // //   set(({ currentChat }) => ({
  // //     isStreaming: !(!newBuffer || !!newBuffer?.error), // not streaming if no buffer or buffer has error
  // //     streamBuffer: newBuffer
  // //       ? {
  // //           id: currentChat?.id ?? "",
  // //           messageId: newBuffer?.messageId ?? "",
  // //           words: newBuffer?.words ?? [],
  // //           lastUpdatedAt: new Date().getTime(),
  // //           error: newBuffer?.error ?? null,
  // //         }
  // //       : null,
  // //   }));
  // // },

  // newChat: (firstMessage: string) => {
  //   // Dummy implementation lol
  //   // TODO: register with server
  //   const id = crypto.randomUUID() as ChatId;
  //   console.debug("Creating new chat:", id);
  //   const newChat: Chat = {
  //     id,
  //     title: undefined,
  //     creatorId: "jaksdfjaskf",
  //     messages: [
  //       {
  //         id: crypto.randomUUID(),
  //         status: "completed",
  //         generationTime: undefined,
  //         role: "user",
  //         content: firstMessage,
  //         timestamp: new Date(),
  //         modelId: DEFAULT_MODEL,
  //         parentId: undefined,
  //         chatId: id,
  //       }
  //     ],
  //     createdAt: new Date(),
  //     lastUpdatedAt: new Date(),
  //   }; // TODO: fetch something from server legit

  //   return id;
  // },
  // addSection: (id: ChatId, section: Section) => {
  //   set((state) => ({
  //     currentChat: {
  //       id,
  //       title: state.currentChat?.title ?? null,
  //       sections: [...(state.currentChat?.sections ?? []), section],
  //       lastUpdatedAt: new Date().getTime(),
  //     },
  //   }));
  // },

  // setSection: (
  //   id: ChatId,
  //   sectionId: string,
  //   f: (_section: Section) => Partial<Omit<Section, "id" | "createdAt">>
  // ) => {
  //   set((state) => {
  //     // find the section in the current chat
  //     const sections = state.currentChat?.sections ?? [];
  //     const index = sections.findIndex((s) => s.id === sectionId);

  //     if (index === -1) {
  //       console.warn("Section not found:", sectionId);
  //       return {};
  //     }

  //     // update the section
  //     const updatedSections = [...sections];
  //     updatedSections[index] = {
  //       ...updatedSections[index],
  //       ...f(updatedSections[index]), // overwrite defined properties
  //     };

  //     return {
  //       currentChat: {
  //         id,
  //         title: state.currentChat?.title ?? null,
  //         sections: updatedSections,
  //         lastUpdatedAt: new Date().getTime(),
  //       },
  //     };
  //   });
  // },

  // setTitle: (id: ChatId, title: string) => {
  //   set(({ currentChat }) => {
  //     if (!currentChat) {
  //       console.warn("No current chat to set title for.");
  //       return {};
  //     }

  //     return {
  //       currentChat: {
  //         ...currentChat,
  //         title,
  //       },
  //     };
  //   });
  // },
}));

// TODO: Re-write everything after updating models
