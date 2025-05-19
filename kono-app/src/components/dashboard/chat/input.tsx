import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatsStore } from "@/lib/chat/store";
import { Section } from "@/lib/chat/types";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Lightbulb, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ActiveButton = "none" | "add" | "deepSearch" | "think";

export default function ChatInput() {
  const id = useChatsStore((state) => state.currentConversation?.id);
  const newChat = useChatsStore((state) => state.newChat);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [hasTyped, setHasTyped] = useState(false);
  const [activeButton, setActiveButton] = useState<ActiveButton>("none");

  const isStreaming = useChatsStore((state) => state.isStreaming);
  const isMobile = useChatsStore((state) => state.isMobile);
  const addSection = useChatsStore((state) => state.addSection);

  // Mount new chat on first load
  useEffect(() => {
    newChat();
  }, [newChat]);

  // Fetch chat conversation on id change

  // Mutate chat conversation by posting response
  const queryClient = useQueryClient();
  const sendPrompt = useMutation({
    // TODO: support different types of user input
    // TODO: include "target" last message to reconciliate with cloud-client state discrepancies
    mutationFn: async (userMessage: string) => {
      // TODO: fix animations (eg. vibration)

      if (!id) {
        throw new Error("Conversation ID is not defined");
      }

      // Initialize message of user
      const userMessageObj = {
        id: crypto.randomUUID(),
        messages: [
          {
            id: crypto.randomUUID(),
            content: userMessage,
            type: "user",
            completed: null,
            newSection: true,
          },
        ],
        date: new Date().toISOString(),
        generationTime: new Date().getTime(),
        isRendering: false,
      } as Section;
      // Add the message to the conversation
      addSection(id, userMessageObj);

      // TODO: impl
      // Add a delay before the second vibration
      // setTimeout(() => {
      //   // Add vibration when streaming begins
      //   navigator.vibrate(50);
      // }, 200); // 200ms delay to make it distinct from the first vibration
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
    },
  });

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
              placeholder={
                isStreaming ? "Waiting for response..." : "Ask Anything"
              }
              className="min-h-[24px] max-h-[160px] w-full rounded-3xl border-0 bg-transparent text-gray-900 placeholder:text-gray-400 placeholder:text-base focus-visible:ring-0 focus-visible:ring-offset-0 text-base pl-2 pr-4 pt-0 pb-0 resize-none overflow-y-auto leading-tight"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
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
