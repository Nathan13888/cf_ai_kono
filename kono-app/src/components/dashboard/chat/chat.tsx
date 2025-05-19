import { useChatsStore } from "@/lib/chat/store";
import { Message, StreamBuffer } from "@/lib/chat/types";
import { cn } from "@/lib/utils";
import { Copy, RefreshCcw, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Chat() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const newSectionRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useChatsStore((state) => state.isMobile);

  const id = useChatsStore((state) => state.currentConversation?.id);
  const currentSections = useChatsStore(
    (state) => state.currentConversation?.sections
  );
  const isStreaming = useChatsStore((state) => state.isStreaming);
  const streamBuffer = useChatsStore((state) => state.streamBuffer);

  // Get current chat conversation
  // const {data} = queryOptions({
  //   // TODO: validate changing id is alright??
  //   queryKey: ["chat", id],
  //   queryFn: streamedQuery({
  //     queryFn:
  //   }),
  // });

  // Determine if a section should have fixed height (only for sections after the first)
  const shouldApplyHeight = (sectionIndex: number) => {
    return sectionIndex > 0;
  };

  // Scroll to maximum position when new section is created, but only for sections after the first
  useEffect(() => {
    if (currentSections && currentSections?.length > 1) {
      setTimeout(() => {
        const scrollContainer = chatContainerRef.current;

        if (scrollContainer) {
          // Scroll to maximum possible position
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [id, currentSections]);

  // Focus the textarea on component mount (only on desktop)
  useEffect(() => {
    if (textareaRef.current && !isMobile) {
      textareaRef.current.focus();
    }
  }, [isMobile]);

  // Set focus back to textarea after streaming ends (only on desktop)
  const shouldFocusAfterStreamingRef = useRef(false);
  useEffect(() => {
    if (!isStreaming && shouldFocusAfterStreamingRef.current && !isMobile) {
      // TODO: focus text area after streaming
      // focusTextarea();
      shouldFocusAfterStreamingRef.current = false;
    }
  }, [isStreaming, isMobile]);

  return (
    <div
      ref={chatContainerRef}
      className="flex-grow pb-32 pt-12 px-4 overflow-y-auto"
    >
      {/* TODO: improve loading state */}
      {!currentSections && <span>Loading</span>}
      {currentSections && (
        <div className="max-w-3xl mx-auto space-y-4">
          {currentSections?.map((section, sectionIndex) => (
            <div
              key={section.id}
              ref={
                sectionIndex === currentSections.length - 1 &&
                section.isRendering
                  ? newSectionRef
                  : null
              }
            >
              {/* {section.isRendering && (
                <div
                  style={
                    section.isActive && shouldApplyHeight(section.sectionIndex)
                      ? { height: `${getContentHeight()}px` }
                      : {}
                  }
                  className="pt-4 flex flex-col justify-start"
                >
                  {section.messages.map((message) => renderMessage(message))}
                </div>
              )} */}

              {!section.isRendering && (
                <div>
                  {section.messages.map((message) =>
                    renderMessage(message, streamBuffer)
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

// Render a given message
const renderMessage = (message: Message, streamBuffer: StreamBuffer | null) => {
  return (
    <div
      key={message.id}
      className={cn(
        "flex flex-col",
        message.type === "user" ? "items-end" : "items-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] px-4 py-2 rounded-2xl",
          message.type === "user"
            ? "bg-white border border-gray-200 rounded-br-none"
            : "text-gray-900"
        )}
      >
        {/* For user messages or completed system messages, render without animation */}
        {message.content && (
          <span
            className={
              message.type === "system" && !message.completed
                ? "animate-fade-in"
                : ""
            }
          >
            {message.content instanceof Array
              ? message.content.map((chunk) => (
                  <span key={chunk.id} className="inline">
                    {chunk.text}
                  </span>
                ))
              : message.content}
          </span>
        )}

        {/* For streaming messages, render with animation */}
        {!message.completed && (
          <span className="inline">
            {streamBuffer &&
              streamBuffer.id === message.id &&
              streamBuffer.words.map((word) => (
                <span key={word.id} className="animate-fade-in inline">
                  {word.text}
                </span>
              ))}
          </span>
        )}
      </div>

      {/* Message actions */}
      {message.type === "system" && message.completed && (
        <div className="flex items-center gap-2 px-4 mt-1 mb-2">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Copy className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
