import { ChatScreen } from "@/components/dashboard/chat/chat";
import ChatHeader from "@/components/dashboard/chat/header";
import { ChatInput } from "@/components/dashboard/chat/input";
import ChatMenu from "@/components/dashboard/chat/menu";
import { isChatInputValid } from "@/lib/chat";
import {
    getChatById,
    getChatHistory,
    messageChat,
    streamMessage,
} from "@/lib/chat/api";
import { useCreateChat, useNavigateToChat } from "@/lib/chat/route";
import { useChatsStore } from "@/lib/chat/store";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useRef } from "react";

export default function ChatPage({
    chatId,
}: {
    chatId: string | null;
}) {
    const createChat = useCreateChat();
    const navigateToChat = useNavigateToChat();

    const loadChat = useChatsStore((state) => state.loadChat);
    const isMenuOpen = useChatsStore((state) => state.isMenuOpen);

    const currentModel = useChatsStore((state) => state.currentModel);
    const currentChat = useChatsStore((state) => state.currentChat);
    const appendMessage = useChatsStore(
        (state) => state.appendMessageToCurrentChat,
    );
    const appendToLastMessage = useChatsStore(
        (state) => state.appendToLastMessageOfCurrentChat,
    );

    const queryClient = useQueryClient();

    // Fetch chat id
    const { isFetching: isFetchingChat, error: errorFetchingChat } = useQuery({
        queryKey: ["chat", chatId], // TODO: refactor to constant
        queryFn: async () => {
            // pass if chat is not loaded
            if (!chatId) {
                await loadChat(null);
                return null;
            }

            // console.warn("Fetching chat", chatId);
            console.debug("Fetching chat by ID:", chatId);
            const chat = await getChatById(chatId);
            if (!chat) {
                throw new Error(`Chat with ID ${chatId} not found.`);
            }

            await loadChat(chat);

            return null; // data is loaded into store instead
        },
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: false,
    });

    // Fetch chat history
    const {
        data: chatHistory,
        isFetching: isFetchingChatHistory,
        error: errorFetchingChatHistory,
    } = useQuery({
        queryKey: ["history"],
        queryFn: async () => {
            return await getChatHistory();
        },
    });

    // Mutate chat send message
    const router = useRouter();
    const {
        mutate: sendMessage,
        isPending: isSendingMessage,
        error: errorSendingMessage,
    } = useMutation({
        mutationFn: async (message: string) => {
            // if (!currentChat) {
            //     throw new Error("No current chat to send message to.");
            // }

            // Validate input
            if (!isChatInputValid(message)) {
                throw new Error("Invalid chat input.");
            }

            // Trim whitespace
            const cleanedMessage = message.trim();

            const id = chatId ?? (crypto.randomUUID() as string);
            if (!chatId) {
                // NOTE: new chat must have successfully been created
                console.debug("New chat created with ID:", id);
                await loadChat(null); // clear current chat
                await router.navigate({
                    to: "/chat/$id",
                    params: { id },
                });
            }

            // Request API change
            const parsed = await messageChat(id, cleanedMessage, currentModel);
            if (!parsed) {
                throw new Error("Failed to send message to chat.");
            }

            // Sanity check
            // if (
            //     parsed.reply.chatId !== currentChat.id ||
            //     parsed.new.chatId !== currentChat.id
            // ) {
            //     // ...
            // }

            console.debug(
                "Received new message and reply from chat API:",
                parsed,
            );

            // Add new message to the current chat
            appendMessage(parsed.new);

            // Attempt to stream the reply message if it is not completed
            if (parsed.reply.status !== "completed") {
                appendMessage(parsed.reply);

                // Wait for streaming to complete
                console.warn(
                    "Streaming started for reply message:",
                    parsed.reply.id,
                );
                await streamMessage(parsed.reply.id, (chunk: string) => {
                    console.debug("Received chunk:", chunk);
                    appendToLastMessage(chunk);
                });
                console.warn(
                    "Streaming completed for reply message:",
                    parsed.reply.id,
                );

                // Refetch the chat
                queryClient.invalidateQueries({
                    queryKey: ["chat", chatId],
                });
            } else {
                appendMessage(parsed.reply);
            }
        },
        onError: (error: Error) => {
            console.error("Error sending message:", error);
            // TODO: handle error in UI
        },
    });

    const mainContainerRef = useRef<HTMLDivElement>(null);
    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden overflow-x-hidden">
            <ChatHeader createChat={createChat} className="z-20 h-12" />

            {/* Main Content Area */}
            <div className="flex h-full overscroll-none" ref={mainContainerRef}>
                {/* LEFT: Chat Menu - Overlay */}
                <ChatMenu
                    history={chatHistory ?? []}
                    navigateToChat={navigateToChat}
                    mainContainerRef={mainContainerRef}
                    className={cn(
                        // "absolute top-0 left-0",
                        "flex",
                        "h-full w-72 z-10 transition-transform duration-300 ease-out",
                        isMenuOpen ? "translate-x-0" : "-translate-x-full",
                    )}
                />

                {/* RIGHT: Chat Container */}
                <div
                    className={cn(
                        "flex flex-col w-full justify-center items-start h-full",
                    )}
                >
                    <div className="flex-1 w-full mt-12 mb-6 overflow-y-auto">
                        {/* Shadow */}
                        {/* <div className="absolute inset-x-0 top-0 z-50 h-4 mt-12 pointer-events-none bg-gradient-to-b from-blue-400/20 to-transparent"></div> */}

                        {/* TODO: fix bottom margin to match input height */}
                        <ChatScreen
                            className="h-full max-w-3xl px-4 mx-auto"
                            isFetching={isFetchingChat}
                            error={
                                errorSendingMessage ??
                                errorFetchingChat ??
                                errorFetchingChatHistory
                            }
                            key={chatId}
                        />
                    </div>

                    <div className="flex-shrink-0 w-full">
                        <ChatInput
                            sendMessage={(input: string) => {
                                sendMessage(input);
                            }}
                            isStreaming={isSendingMessage}
                            placeholder={"Ask anything..."}
                            className="mb-3"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
