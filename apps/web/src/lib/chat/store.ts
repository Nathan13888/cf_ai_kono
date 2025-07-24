import { DEFAULT_MODEL, type ModelId } from "@/lib/constants";
import type { Chat, ChatId, Message } from "@kono/models";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ActiveButton, ActiveChat, RawChatChunk } from "./types";

// TODO: refactor name
// TODO: refactor to @kono/ui
interface ChatState {
    // Page layout
    isMobile: boolean | null;
    setIsMobile: (_: boolean) => void;
    // viewportHeight: number;
    // setViewportHeight: (_: number) => void;

    // UI States
    isMenuOpen: boolean;
    openMenu: () => void;
    closeMenu: () => void;
    toggleMenu: () => void;

    // Input States
    currentModel: ModelId;
    setCurrentModel: (id: ModelId) => void;
    activeButton: ActiveButton;
    setActiveButton: (
        _: ((_: ActiveButton) => ActiveButton) | ActiveButton,
    ) => void;
    newChatMessage: string;
    setNewChatMessage: (message: string) => void;

    // Chat Histories
    // TODO: chat caching
    // TODO: histories

    // Current Chat
    currentChat: ActiveChat | null;
    loadChat: (chat: Chat | null) => void;
    appendMessageToCurrentChat: (message: Message) => void;
    appendToLastMessageOfCurrentChat: (chunk: RawChatChunk) => void;
    error: string | null;
    setTitle: (id: ChatId, title: string) => void;
}

// TODO: refactor name
export const useChatsStore = create<ChatState>()(
    immer((set) => ({
        isMobile: null,
        // viewportHeight: 0,
        setIsMobile: (isMobile: boolean) => {
            set({ isMobile });
        },
        // setViewportHeight: (vh: number) => {
        //   set({ viewportHeight: vh });
        // },

        isMenuOpen: false, // defaults to closed in case window is tiny
        openMenu: () => set({ isMenuOpen: true }),
        closeMenu: () => set({ isMenuOpen: false }),
        toggleMenu: () => {
            set((state) => {
                state.isMenuOpen = !state.isMenuOpen;
            });
        },

        currentModel: DEFAULT_MODEL, // TODO: persistence. Fetch from local storage in the future
        setCurrentModel: (id: ModelId) => {
            set({ currentModel: id });
        },
        activeButton: "none",
        setActiveButton: (
            f: ((_prev: ActiveButton) => ActiveButton) | ActiveButton,
        ) =>
            set(({ activeButton }) => ({
                activeButton: typeof f === "function" ? f(activeButton) : f,
            })), // TODO: Check why there is a single active button
        newChatMessage: "",
        setNewChatMessage: (message: string) =>
            set({ newChatMessage: message }),

        currentChat: null,
        loadChat: (chat: Chat | null) => {
            set((state) => {
                // TODO: check if current chat is already set
                if (!chat) {
                    state.currentChat = null;
                    return;
                }
                state.currentChat = {
                    ...chat,
                };
            });
        },
        appendMessageToCurrentChat: (message: Message) => {
            set(({ currentChat }) => {
                if (!currentChat) {
                    console.warn("No current chat to append message to.");
                    return;
                }

                // append new message
                currentChat.messages.push(message);
            });
        },
        appendToLastMessageOfCurrentChat: (chunk: RawChatChunk) => {
            set(({ currentChat }) => {
                if (!currentChat) {
                    console.warn("No current chat to update last message for.");
                    return;
                }

                if (currentChat.messages.length === 0) {
                    console.error("Current chat has no messages to append to.");
                    return;
                }

                // append to last message
                currentChat.messages[currentChat.messages.length - 1].content +=
                    chunk;
            });
        },
        error: null,

        setTitle: (id: ChatId, title: string) => {
            set(({ currentChat }) => {
                if (!currentChat) {
                    console.warn("No current chat to set title for.");
                    return {};
                }

                return {
                    currentChat: {
                        ...currentChat,
                        title,
                    },
                };
            });
        },
    })),
);
