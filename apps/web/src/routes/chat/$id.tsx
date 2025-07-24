import { ChatScreen } from "@/components/dashboard/chat/chat";
import ChatHeader from "@/components/dashboard/chat/header";
import { ChatInput } from "@/components/dashboard/chat/input";
import ChatMenu from "@/components/dashboard/chat/menu";
import { getChatById, getChatHistory } from "@/lib/chat/api";
import { useCreateChat, useNavigateToChat } from "@/lib/chat/route";
import { useChatsStore } from "@/lib/chat/store";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

// Constants for layout calculations to account for the padding values
const TOP_PADDING = 48; // pt-12 (3rem = 48px)
const BOTTOM_PADDING = 128; // pb-32 (8rem = 128px)
const ADDITIONAL_OFFSET = 16; // Reduced offset for fine-tuning

export const Route = createFileRoute("/chat/$id")({
    component: RouteComponent,
});

function RouteComponent() {
    const { id: chatId } = Route.useParams();
    const createChat = useCreateChat();

    // const activeChat = useChatsStore((state) => state.currentChat);
    const currentModel = useChatsStore((state) => state.currentModel);
    const loadChat = useChatsStore((state) => state.loadChat);
    const isMenuOpen = useChatsStore((state) => state.isMenuOpen);

    // Fetch chat id
    const { isFetching: isFetchingChat, error: errorFetchingChat } = useQuery({
        queryKey: ["chat", chatId], // TODO: refactor to constant
        queryFn: async () => {
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

    const navigateToChat = useNavigateToChat();

    // Check if device is mobile and get viewport height
    const mainContainerRef = useRef<HTMLDivElement>(null);

    // TODO(high): fix layout
    // const isMobile = useChatsStore((state) => state.isMobile);
    // const setIsMobile = useChatsStore((state) => state.setIsMobile);
    // const viewportHeight = useChatsStore((state) => state.viewportHeight);
    // const setViewportHeight = useChatsStore((state) => state.setViewportHeight);
    // useEffect(() => {
    //     const checkMobileAndViewport = () => {
    //         const isMobileDevice = window.innerWidth < 768;
    //         setIsMobile(isMobileDevice);

    //         // Capture the viewport height
    //         const vh = window.innerHeight;
    //         setViewportHeight(vh);

    //         // Apply fixed height to main container on mobile
    //         if (isMobileDevice && mainContainerRef.current) {
    //             mainContainerRef.current.style.height = `${vh}px`;
    //         }
    //     };
    //     checkMobileAndViewport();

    //     // Set initial height
    //     if (mainContainerRef.current) {
    //         mainContainerRef.current.style.height = isMobile
    //             ? `${viewportHeight}px`
    //             : "100svh";
    //     }

    //     // Update on resize
    //     window.addEventListener("resize", checkMobileAndViewport);

    //     return () => {
    //         window.removeEventListener("resize", checkMobileAndViewport);
    //     };
    // }, [isMobile, viewportHeight, setIsMobile, setViewportHeight]);
    // const getContentHeight = () => {
    //     // Calculate available height by subtracting the top and bottom padding from viewport height
    //     return (
    //         viewportHeight - TOP_PADDING - BOTTOM_PADDING - ADDITIONAL_OFFSET
    //     );
    // };

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
                            error={errorFetchingChat}
                            key={chatId}
                        />
                    </div>

                    <div className="flex-shrink-0 w-full">
                        <ChatInput
                            chatId={chatId}
                            placeholder={"Ask anything..."}
                            className="mb-3"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
