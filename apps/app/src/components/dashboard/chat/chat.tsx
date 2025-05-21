import MessageRenderer from "@/components/ui/chat-renderer";
import { useChatsStore } from "@/lib/chat/store";
import type { Message } from "@/lib/chat/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Copy, Loader, RefreshCcw, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Chat({ className }: { className?: string }) {
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
    <div ref={chatContainerRef} className={cn("relative flex-1", className)}>
      {/* TODO: improve loading state */}
      {!currentSections && <span>Loading</span>}
      {currentSections && currentSections.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500">No messages yet</span>
        </div>
      )}
      {currentSections && currentSections.length > 0 && (
        <div className="h-full max-w-3xl mx-auto space-y-4 ">
          <div className="h-12" />

          {/* Chat Sections */}
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
                  className="flex flex-col justify-start pt-4"
                >
                  {section.messages.map((message) => renderMessage(message))}
                </div>
              )} */}

              {!section.isRendering && (
                <div>
                  {section.messages.map((message) => {
                    // TODO: clean up this mess
                    const StreamContent: React.FC = () =>
                      streamBuffer &&
                      streamBuffer.id === message.id &&
                      streamBuffer.words.map((word) => (
                        <span key={word.id} className="inline animate-fade-in">
                          {word.text}
                        </span>
                      ));
                    // console.log(streamBuffer);

                    return renderMessage(message, StreamContent);
                  })}
                </div>
              )}
            </div>
          ))}

          {streamBuffer &&
            streamBuffer.error &&
            streamBuffer.error.length > 0 && (
              <div className="flex flex-col w-2/3 p-4 border items-left rounded-xl h-fit bg-slate-100 border-slate-200">
                <span className="font-bold text-slate-900">
                  An error has occured :(
                </span>
                <span className="text-red-500 ">
                  <code className="font-mono">{streamBuffer.error}</code>
                </span>
                {/* TODO: fix time */}
                {/* <span>{timeAgoString(streamBuffer.lastUpdatedAt)}</span> */}
              </div>
            )}

          {
            // Loading indicator spinner
            isStreaming && <Loader className="h-8 animate-spin" />
          }
          <div ref={messagesEndRef} />

          {/* NOTE: placed beneath on purpose */}
          <div className="h-8" />
        </div>
      )}
    </div>
  );
}

// Render a given message
// TODO: Render custom `<think>` element properly
const renderMessage = (message: Message, StreamContent: React.FC) => {
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
          "max-w-[80%] py-2 rounded-2xl",
          message.type === "user"
            ? "bg-white border border-gray-200 rounded-br-none px-4" // USER
            : "text-gray-900" // AGENT
        )}
      >
        {message.content && (
          <span
            className={cn(
              message.type === "assistant" && !message.completed
                ? "animate-fade-in"
                : ""
            )}
          >
            {Array.isArray(message.content) ? (
              message.content.map((chunk) => (
                <span key={chunk.id} className="inline">
                  <MessageRenderer content={chunk.text} />
                </span>
              ))
            ) : (
              <MessageRenderer content={message.content} />
            )}
          </span>
        )}

        {
          <span className="inline">
            <StreamContent />
          </span>
        }
      </div>

      {/* Message actions */}
      {message.type === "assistant" && message.completed && (
        <div className="flex items-center gap-2 px-4 mt-1 mb-2">
          <button
            type="button"
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {/* <button
            type="button" className="text-gray-400 transition-colors hover:text-gray-600">
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            type="button" className="text-gray-400 transition-colors hover:text-gray-600">
            <ThumbsDown className="w-4 h-4" />
          </button> */}
          {/* TODO: support error state */}
        </div>
      )}
      {/* TODO: support system sate */}
    </div>
  );
};

const timeAgoString = (timestamp: number) => {
  const date = new Date(timestamp);
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
    };

    // Initial update
    updateTimeAgo();

    const intervalId = setInterval(updateTimeAgo, 1000); // Update every 1 second
    return () => clearInterval(intervalId);
  }, []);

  return <span>{timeAgo}</span>;
};
