import { Button } from "@/components/ui/button";
import { useChatsStore } from "@/lib/chat/store";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MemoizedMarkdown from "./markdown";

// TODO: Re-write everything after updating models

export interface ChatScreenProps extends React.HTMLProps<HTMLDivElement> {
    isFetching?: boolean;
    error: Error | null;
    className?: string;
}

// ScrollToBottomButton component
interface ScrollToBottomButtonProps {
    chatContainer: React.RefObject<HTMLDivElement>;
    messagesEnd: React.RefObject<HTMLDivElement>;
}

function useShowButton({
    chatContainer,
    messagesEnd,
}: ScrollToBottomButtonProps) {
    const [showButton, setShowButton] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        const container = chatContainer.current;

        if (!container) {
            setShowButton(false);
            return;
        }

        // Find the last message element
        const lastMessageElement = container.querySelector(
            "[data-message-index]:last-of-type",
        );

        if (!lastMessageElement) {
            setShowButton(false);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                // Show button when the last message is not fully visible
                setShowButton(!entry.isIntersecting);
            },
            {
                root: container,
                threshold: 0.8, // Show button when less than 80% of last message is visible
            },
        );

        // Scroll event handler to hide button while scrolling
        let scrollTimeout: NodeJS.Timeout;
        const handleScroll = () => {
            setIsScrolling(true);

            // Clear existing timeout
            clearTimeout(scrollTimeout);

            // Set timeout to show button again after scrolling stops
            scrollTimeout = setTimeout(() => {
                setIsScrolling(false);
            }, 300); // Hide for some time after scroll stops
        };

        observer.observe(lastMessageElement);
        container.addEventListener("scroll", handleScroll);

        return () => {
            observer.disconnect();
            container.removeEventListener("scroll", handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, [chatContainer]);

    // Return false if scrolling, otherwise return the intersection state
    return showButton && !isScrolling;
}

export function ChatScreen({
    isFetching,
    error,
    className,
    ...props
}: ChatScreenProps) {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const activeChat = useChatsStore((state) => state.currentChat);

    useEffect(() => {
        console.debug("Updated chat:", activeChat?.id);
    }, [activeChat?.id]);

    // Scroll to bottom functionality
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        const container = chatContainerRef.current;
        const messagesEndElement = messagesEndRef.current;

        if (container && messagesEndElement) {
            // First try scrollIntoView on the messagesEnd element
            messagesEndElement.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });

            // Alternative approach: scroll the container to its full height
            // This ensures we reach the absolute bottom
            setTimeout(() => {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: "smooth",
                });
            }, 100);
        }
    };
    const showButton = useShowButton({
        chatContainer: chatContainerRef,
        messagesEnd: messagesEndRef,
    });

    return (
        <div className="relative w-full h-full">
            <div
                ref={chatContainerRef}
                className="h-full overflow-y-auto"
                style={{
                    scrollbarGutter: "stable",
                }}
            >
                {!isFetching && activeChat && activeChat.messages.length > 0 ? (
                    // Render chat messages when available
                    <>
                        <div
                            className={cn(
                                "flex flex-col h-full gap-2 pr-0",
                                className,
                            )}
                        >
                            {/* Render each message */}
                            {activeChat?.messages.map((message, index) => (
                                <div
                                    key={`${message.id}-${message.content.length}`}
                                    data-message-index={index}
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
                        {/* Placeholder for bottom of chat */}
                        <div ref={messagesEndRef} className="h-4" />
                    </>
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
                            <div className="text-gray-500">
                                No messages yet.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Scroll to bottom button - positioned relative to the component container */}
            {showButton && (
                <div>
                    <Button
                        onClick={scrollToBottom}
                        size="sm"
                        variant="secondary"
                        className={cn(
                            "absolute z-10 w-10 h-10 transition-shadow -translate-x-1/2 rounded-full shadow-lg bottom-4 left-1/2 hover:shadow-xl",
                            "translation-all duration-500 ease-in-out", // TODO(ui): smooth transition
                        )}
                    >
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
