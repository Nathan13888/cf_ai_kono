import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatsStore } from "@/lib/chat/store";
import type {
  ActiveButton,
  Chunk,
  MessageType,
  Section,
} from "@/lib/chat/types";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Lightbulb, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatInput() {
  const id = useChatsStore((state) => state.currentConversation?.id);
  const newChat = useChatsStore((state) => state.newChat);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [hasTyped, setHasTyped] = useState(false);
  const activeButton = useChatsStore((state) => state.activeButton);
  const setActiveButton = useChatsStore((state) => state.setActiveButton);

  const isStreaming = useChatsStore((state) => state.isStreaming);
  const streamBuffer = useChatsStore((state) => state.streamBuffer);
  const setStreaming = useChatsStore((state) => state.setStreaming);
  const isMobile = useChatsStore((state) => state.isMobile);
  const currentSections = useChatsStore(
    (state) => state.currentConversation?.sections
  );
  const addSection = useChatsStore((state) => state.addSection);
  const setSection = useChatsStore((state) => state.setSection);

  // Mount new chat on first load
  useEffect(() => {
    if (!id) {
      newChat();
      console.log("New chat created:", id);
    }
  }, [id, newChat]);

  // Fetch chat conversation on id change

  // Mutate chat conversation by posting response
  // TODO: refactor some logic??
  const queryClient = useQueryClient();
  const sendPrompt = useMutation({
    // TODO: support different types of user input
    // TODO: include "target" last message to reconciliate with cloud-client state discrepancies
    mutationFn: async (userMessage: string) => {
      if (!id) {
        throw new Error("Conversation ID is not defined");
      }

      // Initialize message of user
      const userMessageObj = {
        id: crypto.randomUUID(),
        thinking: null,
        messages: [
          {
            id: crypto.randomUUID(),
            content: userMessage,
            type: "user",
            completed: true,
          },
        ],
        date: new Date().toISOString(),
        generationTime: new Date().getTime(),
        isRendering: false,
      } as Section;
      addSection(id, userMessageObj);

      // TODO: fix animations (eg. vibration)
      // Add a delay before the second vibration
      // setTimeout(() => {
      //   // Add vibration when streaming begins
      //   navigator.vibrate(50);
      // }, 200); // 200ms delay to make it distinct from the first vibration

      // Prepare stream from server
      const responseSectionId = crypto.randomUUID(); // response from agent
      const messageId = crypto.randomUUID(); //
      addSection(id, {
        id: responseSectionId,
        thinking: null,
        messages: [
          {
            id: messageId,
            content: null,
            type: "assistant",
            completed: null, // TODO: null or false?
          },
        ], // no messages to indicate rendering
        date: new Date().toISOString(),
        generationTime: new Date().getTime(),
        // isRendering: true,
        isRendering: false, // TODO: yeet dis shit
      });

      setStreaming({
        messageId,
        words: [],
        lastUpdatedAt: new Date().getTime(),
        error: null,
      });

      // Hit chat endpoint
      // Prepare request
      const messages =
        currentSections?.flatMap(
          (section) =>
            section.messages
              .map((message) => {
                if (message?.content) {
                  let content = "";
                  if (typeof message.content === "string") {
                    content = message.content;
                  } else if (Array.isArray(message.content)) {
                    content = message.content
                      .map((chunk: Chunk) => chunk.text)
                      .join("");
                  }
                  return {
                    role: message.type,
                    content: content,
                  };
                }

                return undefined;
              })
              .filter((i) => i !== undefined) // Filter out undefined values
        ) ?? [];
      messages.push({
        role: "user" as MessageType,
        content: userMessage,
      });
      console.log("Sending messages:", messages);
      const response = await client.chat.$post({
        query: {
          // modelId: "gemini-2.5-flash-preview-05-20",
          modelId: "qwen3:1.7b",
        },
        json: {
          messages: messages,
        },
      });
      // Process stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        throw new Error(`Failed to get reader from response: ${response}`);
      }
      let streamingMessage = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream finished"); // TODO: Remove
          break;
        }
        const chunk: string = decoder.decode(value, { stream: true });
        console.log("Received chunk:", chunk); // TODO: Remove
        streamingMessage += chunk;

        // Append chunk to section
        setSection(id, responseSectionId, {
          messages: [
            {
              id: messageId,
              content: streamingMessage,
              type: "assistant",
              completed: false,
            },
          ],
          isRendering: false,
        });

        // setStreaming({
        //   messageId,
        //   words: mockWords.slice(0, i + 1),
        //   lastUpdatedAt: new Date().getTime(),
        //   error: null,
        // });
      }

      // TODO: Detect if response was non-200, it should display as an error.

      // Wrap up streaming
      setSection(id, responseSectionId, {
        messages: [
          {
            id: messageId,
            content: streamingMessage,
            type: "assistant",
            completed: true,
          },
        ],
        // TODO: check this property
        isRendering: false,
      });
      setStreaming(null);

      // Stream the text
      // TODO: impl
      // Add vibration when streaming ends
      // navigator.vibrate(50);
    },
    onSuccess: () => {
      console.warn("TODO: onSuccess");
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
    },
    onError: (error) => {
      console.error("Error sending prompt:", error);
      // TODO: set error is last section
    },
  });

  // Watch for changes in the stream buffer
  useEffect(() => {
    console.warn("Stream buffer changed:", isStreaming, streamBuffer);
  }, [isStreaming, streamBuffer]);

  // Watch for changes in the input value
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.max(
        24,
        Math.min(textareaRef.current.scrollHeight, 160)
      );
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  const handleInputContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only focus if clicking directly on the container, not on buttons or other interactive elements
    if (
      e.target === e.currentTarget ||
      (e.currentTarget === inputContainerRef.current &&
        !(e.target as HTMLElement).closest("button"))
    ) {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Only allow input changes when not streaming
    if (!isStreaming) {
      setInputValue(newValue);

      if (newValue.trim() !== "" && !hasTyped) {
        setHasTyped(true);
      } else if (newValue.trim() === "" && hasTyped) {
        setHasTyped(false);
      }

      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        const newHeight = Math.max(24, Math.min(textarea.scrollHeight, 160));
        textarea.style.height = `${newHeight}px`;
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isStreaming) {
      // Add vibration when message is submitted
      // navigator.vibrate(50);

      const userMessage = inputValue.trim();

      // Reset input
      setInputValue("");
      setHasTyped(false);
      setActiveButton("none");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // Add the message after resetting input

      // Only focus the textarea on desktop, not on mobile
      if (!isMobile) {
        focusTextarea();
      } else {
        // On mobile, blur the textarea to dismiss the keyboard
        if (textareaRef.current) {
          textareaRef.current.blur();
        }
      }

      // Query for response
      sendPrompt.mutate(userMessage);
    }
  };

  // Save the current selection state
  const selectionStateRef = useRef({
    start: null as number | null,
    end: null as number | null,
  });
  const saveSelectionState = () => {
    if (textareaRef.current) {
      selectionStateRef.current = {
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      };
    }
  };

  // Restore the saved selection state
  const restoreSelectionState = () => {
    const textarea = textareaRef.current;
    const { start, end } = selectionStateRef.current;

    if (textarea && start !== null && end !== null) {
      // Focus first, then set selection range
      textarea.focus();
      textarea.setSelectionRange(start, end);
    } else if (textarea) {
      // If no selection was saved, just focus
      textarea.focus();
    }
  };

  const focusTextarea = () => {
    if (textareaRef.current && !isMobile) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Cmd+Enter on both mobile and desktop
    if (!isStreaming && e.key === "Enter" && e.metaKey) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }

    // Only handle regular Enter key (without Shift) on desktop
    if (!isStreaming && !isMobile && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleButton = (button: ActiveButton) => {
    if (!isStreaming) {
      // Save the current selection state before toggling
      saveSelectionState();

      setActiveButton((prev) => (prev === button ? "none" : button));

      // Restore the selection state after toggling
      setTimeout(() => {
        restoreSelectionState();
      }, 0);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div
          ref={inputContainerRef}
          className={cn(
            "relative w-full rounded-3xl border border-gray-200 bg-white p-3 cursor-text",
            isStreaming && "opacity-80"
          )}
          onClick={handleInputContainerClick}
        >
          {/* CHAT INPUT */}
          <div className="pb-9">
            <Textarea
              ref={textareaRef}
              placeholder="Ask Anything"
              className="min-h-[24px] max-h-[160px] w-full rounded-3xl border-0 bg-transparent text-gray-900 placeholder:text-gray-400 placeholder:text-base focus-visible:ring-0 focus-visible:ring-offset-0 text-base pl-2 pr-4 pt-0 pb-0 resize-none overflow-y-auto leading-tight"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoFocus
              onFocus={() => {
                // Ensure the textarea is scrolled into view when focused
                // TODO: allow user setting
                if (textareaRef.current) {
                  textareaRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }}
            />
          </div>

          {/* PROMPT OPTIONS */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between">
              {/* LEFT ISLAND */}
              <div className="flex items-center select-none space-x-2 ">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "rounded-full h-8 w-8 flex-shrink-0 border-gray-200 p-0 transition-colors",
                    activeButton === "add" && "bg-gray-100 border-gray-300"
                  )}
                  onClick={() => toggleButton("add")}
                  disabled={isStreaming}
                >
                  <Plus
                    className={cn(
                      "h-4 w-4 text-gray-500",
                      activeButton === "add" && "text-gray-700"
                    )}
                  />
                  <span className="sr-only">Add</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "rounded-full h-8 px-3 flex items-center border-gray-200 gap-1.5 transition-colors",
                    activeButton === "deepSearch" &&
                      "bg-gray-100 border-gray-300"
                  )}
                  onClick={() => toggleButton("deepSearch")}
                  disabled={isStreaming}
                >
                  <Search
                    className={cn(
                      "h-4 w-4 text-gray-500",
                      activeButton === "deepSearch" && "text-gray-700"
                    )}
                  />
                  <span
                    className={cn(
                      "text-gray-900 text-sm",
                      activeButton === "deepSearch" && "font-medium"
                    )}
                  >
                    DeepSearch
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "rounded-full h-8 px-3 flex items-center border-gray-200 gap-1.5 transition-colors",
                    activeButton === "think" && "bg-gray-100 border-gray-300"
                  )}
                  onClick={() => toggleButton("think")}
                  disabled={isStreaming}
                >
                  <Lightbulb
                    className={cn(
                      "h-4 w-4 text-gray-500",
                      activeButton === "think" && "text-gray-700"
                    )}
                  />
                  <span
                    className={cn(
                      "text-gray-900 text-sm",
                      activeButton === "think" && "font-medium"
                    )}
                  >
                    Think
                  </span>
                </Button>
              </div>

              {/* RIGHT ISLAND */}
              <div className="flex items-center select-none space-x-2">
                {/* TODO(high): model section */}
                <Button
                  type="submit"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "rounded-full h-8 w-8 border-0 flex-shrink-0 transition-all duration-200",
                    hasTyped ? "bg-black scale-110" : "bg-gray-200"
                  )}
                  disabled={!inputValue.trim() || isStreaming}
                >
                  <ArrowUp
                    className={cn(
                      "h-4 w-4 transition-colors",
                      hasTyped ? "text-white" : "text-gray-500"
                    )}
                  />
                  <span className="sr-only">Submit</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
