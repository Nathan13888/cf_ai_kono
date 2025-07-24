import { useChatsStore } from "@/lib/chat/store";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import MemoizedMarkdown from "./markdown";

// TODO: Re-write everything after updating models

export interface ChatScreenProps extends React.HTMLProps<HTMLDivElement> {
    isFetching?: boolean;
    error: Error | null;
    className?: string;
}

export function ChatScreen({
    isFetching,
    error,
    className,
    ...props
}: ChatScreenProps) {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    //   const newSectionRef = useRef<HTMLDivElement>(null);
    //   const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const activeChat = useChatsStore((state) => state.currentChat);

    useEffect(() => {
        console.debug("Updated chat:", activeChat?.id);
    }, [activeChat?.id]);

    return (
        <div
            ref={chatContainerRef}
            className={cn("relative flex-1", className)}
        >
            {!isFetching && activeChat && activeChat.messages.length > 0 ? (
                // Render chat messages when available
                <div className="flex flex-col h-full gap-2">
                    {activeChat?.messages.map((message, index) => (
                        <div
                            key={`${message.id}-${message.content.length}`}
                            className={cn(
                                "my-2 p-4",
                                // "border-none hover:border-slate-500 hover:*:bg-accent border-t-2 border-b-2", // TODO(ui): fix shitty styling
                                message.role === "user"
                                    ? "ml-auto mr-0 rounded-md bg-accent w-fit max-w-[calc(100%-10rem)] "
                                    : "mr-5 w-fit max-w-[calc(100%-1.25rem)]", // padding for alternating messages
                            )}
                        >
                            {/* TODO(ui): hover show menu?? */}
                            {/* TODO(ui): s*/}

                            {/* TODO: virtual list */}
                            <MemoizedMarkdown
                                markdown={message.content}
                                className="prose-sm prose max-w-none"
                            />
                        </div>
                    ))}
                </div>
                // TODO: offer button to scroll to bottom if newSectionRef is not in view
                // Placeholder for new section
                // <div ref={newSectionRef} className="h-4"></div>
                // Placeholder for messages end
                // <div ref={messagesEndRef} className="h-4"></div>
            ) : (
                // No messages yet or no active chat
                <div className="flex items-center justify-center h-full">
                    {/* TODO(ui): improve ui */}
                    {error ? (
                        <div className="text-red-500">
                            Error loading messages: {error.toString()}
                        </div>
                    ) : isFetching ? (
                        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                    ) : (
                        <div className="text-gray-500">No messages yet.</div>
                    )}
                </div>
            )}
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
