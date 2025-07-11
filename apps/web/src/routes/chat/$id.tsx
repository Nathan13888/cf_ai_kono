import { ChatScreen } from "@/components/dashboard/chat/chat"; // TODO: << move this import
import { ChatInput } from "@/components/dashboard/chat/input"; // TODO: << move this import
import { createFileRoute } from "@tanstack/react-router";

// import "./chat.css"; // TODO: << is this needed?
import { checkAuthenticated } from "@/lib/auth-client";
import { getChatById } from "@/lib/chat/api";
import { useChatsStore } from "@/lib/chat/store";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

// Constants for layout calculations to account for the padding values
const TOP_PADDING = 48; // pt-12 (3rem = 48px)
const BOTTOM_PADDING = 128; // pb-32 (8rem = 128px)
const ADDITIONAL_OFFSET = 16; // Reduced offset for fine-tuning

export const Route = createFileRoute("/chat/$id")({
    loader: async ({ location, params }) => {
        await checkAuthenticated(location);

        const { id } = params;
        return id;
    },
    component: RouteComponent,
});

function RouteComponent() {
    const chatId: string = Route.useLoaderData();
    // console.warn("Chat ID", chatId);

    // const activeChat = useChatsStore((state) => state.currentChat);
    const currentModel = useChatsStore((state) => state.currentModel);
    const loadChat = useChatsStore((state) => state.loadChat);

    const { isFetching, error } = useQuery({
        queryKey: ["chat", chatId],
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
        // refetchOnMount: true,
        // refetchOnWindowFocus: true,
        // refetchOnReconnect: false,
    });

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
        <div className="flex flex-col flex-1 h-full overflow-x-hidden overflow-y-auto bg-gray-50">
            {/* Shadow */}
            {/* <div className="absolute inset-x-0 top-0 z-50 h-4 mt-12 pointer-events-none bg-gradient-to-b from-blue-400/20 to-transparent"></div> */}

            {/* TODO: fix bottom margin to match input height */}
            {isFetching ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">
                        Waiting for chat data...
                    </div>
                </div>
            ) : (
                <>
                    <ChatScreen className="px-4 mb-48" />

                    <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 bg-gray-50">
                        <ChatInput
                            chatId={chatId}
                            placeholder={"Ask anything..."}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
