import { useChatsStore } from "@/lib/chat/store";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

// TODO: Re-write everything after updating models

export interface ChatScreenProps extends React.HTMLProps<HTMLDivElement> {}

export function ChatScreen({ className, ...props }: ChatScreenProps) {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    //   const newSectionRef = useRef<HTMLDivElement>(null);
    //   const messagesEndRef = useRef<HTMLDivElement>(null);

    //   const textareaRef = useRef<HTMLTextAreaElement>(null);
    //   const isMobile = useChatsStore((state) => state.isMobile);

    //   const id = useChatsStore((state) => state.currentChat?.id);
    //   const currentSections = useChatsStore(
    //     (state) => state.currentChat?.sections
    //   );
    //   // Scroll to maximum position when new section is created, but only for sections after the first
    //   useEffect(() => {
    //     if (currentSections && currentSections?.length > 1) {
    //       setTimeout(() => {
    //         const scrollContainer = chatContainerRef.current;

    //         if (scrollContainer) {
    //           // Scroll to maximum possible position
    //           scrollContainer.scrollTo({
    //             top: scrollContainer.scrollHeight,
    //             behavior: "smooth",
    //           });
    //         }
    //       }, 100);
    //     }
    //   }, [id, currentSections]);

    //   // Focus the textarea on component mount (only on desktop)
    //   useEffect(() => {
    //     if (textareaRef.current && !isMobile) {
    //       textareaRef.current.focus();
    //     }
    //   }, [isMobile]);

    //   // Set focus back to textarea after streaming ends (only on desktop)
    //   const shouldFocusAfterStreamingRef = useRef(false);
    //   useEffect(() => {
    //     if (!isStreaming && shouldFocusAfterStreamingRef.current && !isMobile) {
    //       // TODO: focus text area after streaming
    //       // focusTextarea();
    //       shouldFocusAfterStreamingRef.current = false;
    //     }
    //   }, [isStreaming, isMobile]);

    const activeChat = useChatsStore((state) => state.currentChat);

    useEffect(() => {
        console.debug("Updated chat:", activeChat?.id);
    }, [activeChat]);

    return (
        <div
            ref={chatContainerRef}
            className={cn("relative flex-1", className)}
        >
            {
                // Render chat messages
                activeChat?.messages.map((message, index) => (
                    <div
                        key={message.id}
                        className={cn(
                            "p-4",
                            index % 2 === 0 ? "bg-gray-100" : "bg-white",
                        )}
                    >
                        <div className="text-sm text-gray-500">
                            {new Date(message.timestamp).toLocaleString()}
                        </div>
                        <div className="mt-2">{message.content}</div>
                    </div>
                ))
            }
            {
                // Placeholder for new section
                // <div ref={newSectionRef} className="h-4"></div>
            }
            {
                // Placeholder for messages end
                // <div ref={messagesEndRef} className="h-4"></div>
            }
        </div>
    );
}

// const timeAgoString = (timestamp: number) => {
//     const date = new Date(timestamp);
//     const [timeAgo, setTimeAgo] = useState("");

//     useEffect(() => {
//         const updateTimeAgo = () => {
//             setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
//         };

//         // Initial update
//         updateTimeAgo();

//         const intervalId = setInterval(updateTimeAgo, 1000); // Update every 1 second
//         return () => clearInterval(intervalId);
//     }, []);

//     return <span>{timeAgo}</span>;
// };
