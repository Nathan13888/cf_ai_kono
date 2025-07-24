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

function ScrollToBottomButton({
    chatContainer,
    messagesEnd,
}: ScrollToBottomButtonProps) {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const container = chatContainer.current;
        const messagesEndElement = messagesEnd.current;

        if (!container || !messagesEndElement) return;

        const checkIfAtBottom = () => {
            const observer = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    // Show button when the messages end is not visible
                    setShowButton(!entry.isIntersecting);
                },
                {
                    root: container,
                    threshold: 0.1,
                },
            );

            observer.observe(messagesEndElement);

            return () => observer.disconnect();
        };

        const cleanup = checkIfAtBottom();

        return cleanup;
    }, [chatContainer, messagesEnd]);

    const scrollToBottom = () => {
        const container = chatContainer.current;
        const messagesEndElement = messagesEnd.current;

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

    if (!showButton) return null;

    return (
        <div className="absolute z-10 bottom-4 right-4">
            <Button
                onClick={scrollToBottom}
                size="sm"
                variant="secondary"
                className="transition-shadow rounded-full shadow-lg hover:shadow-xl"
            >
                <ChevronDown className="w-4 h-4" />
            </Button>
        </div>
    );
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

    const messagesEndRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={chatContainerRef}
            className={cn("relative flex-1 overflow-y-auto", className)}
        >
            {!isFetching && activeChat && activeChat.messages.length > 0 ? (
                // Render chat messages when available
                <>
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
                    {/* Placeholder for bottom of chat */}
                    <div ref={messagesEndRef} className="h-4" />

                    {/* Scroll to bottom button */}
                    <ScrollToBottomButton
                        chatContainer={chatContainerRef}
                        messagesEnd={messagesEndRef}
                    />
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
                        <div className="text-gray-500">No messages yet.</div>
                    )}
                </div>
            )}
        </div>
    );
}
