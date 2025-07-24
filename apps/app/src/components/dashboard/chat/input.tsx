import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatsStore } from "@/lib/chat/store";
import type {
  ActiveButton,
} from "@/lib/chat/types";
// import { client } from "@/lib/client";
import {
  AVAILABLE_MODELS,
  type Model,
  type ModelId,
  ModelStatus,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Lightbulb, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  siAlibabadotcom,
  siAnthropic,
  siGooglegemini,
  siMeta,
  siOpenai,
} from "simple-icons";
// import { Message } from "@kono/models";
import { formatChatInput } from "@/lib/chat";

interface ChatInputProps {
  value: string;
  setValue: (input: string) => void;
  placeholder: string;
  /**
   * What to do on submit. Should hold until input is submitted.
   * @param input Input value
   * @returns Whether input was submitted successfully
   */
  onSubmit: (input: string) => Promise<boolean>;
  disabled: boolean;
}

export function ChatInput({
  value,
  setValue,
  placeholder,
  onSubmit,
  disabled = false,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const activeButton = useChatsStore((state) => state.activeButton);
  const setActiveButton = useChatsStore((state) => state.setActiveButton);
  const currentModel = useChatsStore((state) => state.currentModel);
  const setCurrentModel = useChatsStore((state) => state.setCurrentModel);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // const streamBuffer = useChatsStore((state) => state.streamBuffer);
  // const setStreaming = useChatsStore((state) => state.setStreaming);
  // const isMobile = useChatsStore((state) => state.isMobile);
  // const currentSections = useChatsStore(
  //   (state) => state.currentChat?.sections
  // );
  // const addSection = useChatsStore((state) => state.addSection);
  // const setSection = useChatsStore((state) => state.setSection);

  // TODO: vv copy anything useful away from this
  // // Mutate chat chat by posting response
  // const queryClient = useQueryClient();
  // const sendPrompt = useMutation({
  //   // TODO: support different types of user input
  //   // TODO: include "target" last message to reconciliate with cloud-client state discrepancies
  //   mutationFn: async (userMessage: string) => {
  //     // Initialize message of user
  //     const userMessageObj = {
  //       id: crypto.randomUUID(),
  //       thinking: null,
  //       messages: [
  //         {
  //           id: crypto.randomUUID(),
  //           content: userMessage,
  //           type: "user",
  //           completed: true,
  //         },
  //       ],
  //       generationTime: null,
  //       createdAt: Date.now(),
  //       isStreaming: false,
  //     } satisfies Section;
  //     addSection(id, userMessageObj);

  //     // Prepare stream from server
  //     const responseSectionId = crypto.randomUUID(); // response from agent
  //     const messageId = crypto.randomUUID(); // message in response
  //     addSection(id, {
  //       id: responseSectionId,
  //       thinking: null,
  //       messages: [
  //         {
  //           id: messageId,
  //           content: null,
  //           type: "assistant",
  //           completed: null, // TODO: null or false?
  //         },
  //       ], // no messages to indicate rendering
  //       generationTime: null,
  //       createdAt: Date.now(),
  //       isStreaming: false, // TODO: yeet dis shit
  //     } satisfies Section);

  //     setStreaming({
  //       messageId,
  //     });

  //     // Hit chat endpoint
  //     // Prepare request
  //     const messages: Message[] =
  //       currentSections?.flatMap(
  //         (section): Message[] =>
  //           section.messages
  //             .map((message) => {
  //               if (message?.content) {
  //                 let content = "";
  //                 if (typeof message.content === "string") {
  //                   content = message.content;
  //                 } else if (Array.isArray(message.content)) {
  //                   content = message.content
  //                     .map((chunk: Chunk) => chunk.text)
  //                     .join("");
  //                 }
  //                 return {
  //                   id: crypto.randomUUID() as string,
  //                   inProgress: false,
  //                   role: message.type,
  //                   content: content,
  //                   parentId: undefined, // TODO: this is wrong
  //                   timestamp: Date.now(),
  //                   modelId: currentModel,
  //                 };
  //               }

  //               return undefined;
  //             })
  //             .filter((i) => i !== undefined) // Filter out undefined values
  //       ) ?? [];
  //     messages.push({
  //       id: crypto.randomUUID() as string,
  //       inProgress: false,
  //       role: "user" as MessageType,
  //       content: userMessage,
  //       parentId: undefined, // TODO: this is wrong
  //       timestamp: Date.now(),
  //       modelId: currentModel,
  //     });
  //     console.log("Sending messages:", messages);
  //     const response = await client.chat.$post({
  //       query: {
  //         modelId: currentModel,
  //       },
  //       json: {
  //         messages: messages,
  //       },
  //     });
  //     // Process stream
  //     const reader = response.body?.getReader();
  //     const decoder = new TextDecoder();
  //     if (!reader) {
  //       throw new Error(`Failed to get reader from response: ${response}`);
  //     }

  //     let streamingMessage = "";
  //     while (true) {
  //       const { done, value } = await reader.read();
  //       if (done) {
  //         break;
  //       }
  //       const chunk: string = decoder.decode(value, { stream: true });
  //       // console.log("Received chunk:", chunk);
  //       streamingMessage += chunk;

  //       // Append chunk to section
  //       setSection(id, responseSectionId, (old) => ({
  //         messages: [
  //           {
  //             id: messageId,
  //             content: streamingMessage,
  //             type: "assistant",
  //             completed: false,
  //           },
  //         ],
  //         generationTime: Date.now() - old.createdAt,
  //         isStreaming: false, // TODO: fix the rendering shit
  //       }));
  //     }

  //     // TODO: Detect if response was non-200, it should display as an error.

  //     console.log("Final streaming message:", streamingMessage); // TODO: Remove

  //     // Wrap up streaming
  //     setSection(id, responseSectionId, (old) => ({
  //       messages: [
  //         {
  //           id: messageId,
  //           content: streamingMessage,
  //           type: "assistant",
  //           completed: true,
  //         },
  //       ],
  //       generationTime: Date.now() - old.createdAt,
  //       isStreaming: false,
  //     }));
  //   },
  //   onSuccess: () => {
  //     console.warn("TODO: onSuccess");
  //     // setStreaming(null);

  //     // Invalidate and refetch
  //     queryClient.invalidateQueries({ queryKey: ["message", id] });
  //   },
  //   onError: (error) => {
  //     console.error("Error sending prompt:", error);

  //     // add system message
  //     // setStreaming({
  //     //   error: error.message,
  //     // });

  //     // TODO: display error
  //   },
  // });

  // // Watch for changes in the stream buffer
  // useEffect(() => {
  //   console.warn("Stream buffer changed:", !!isSubmitting, streamBuffer);
  // }, [!!isSubmitting, streamBuffer]);

  // Watch for changes in the input value
  const updateInputHeight = () => {
    if (textareaRef.current) {
      // TODO: why set to auto height and then back to specific px height? vv
      textareaRef.current.style.height = "auto";
      const newHeight = Math.max(
        24,
        Math.min(textareaRef.current.scrollHeight, 160)
      );
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };
  useEffect(() => {
    updateInputHeight();
  }, [value]); // TODO: What is this?

  // const handleInputContainerClick = (
  //   e: React.KeyboardEvent<HTMLDivElement>
  // ) => {
  //   // Only focus if clicking directly on the container, not on buttons or other interactive elements
  //   if (
  //     e.target === e.currentTarget ||
  //     (e.currentTarget === inputContainerRef.current &&
  //       !(e.target as HTMLElement).closest("button"))
  //   ) {
  //     if (textareaRef.current) {
  //       textareaRef.current.focus();
  //     }
  //   }
  // };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Only allow input changes when not streaming
    if (!isSubmitting) {
      setValue(newValue);

      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        const newHeight = Math.max(24, Math.min(textarea.scrollHeight, 160));
        textarea.style.height = `${newHeight}px`;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || disabled) return;
    setIsSubmitting(true);

    const currentInput = value;
    const formattedInput = formatChatInput(currentInput);
    const currentActiveButton = activeButton;

    // Add vibration when message is submitted?
    // navigator.vibrate(50);

    // Reset input
    setValue("");
    setActiveButton("none");

    const success = await onSubmit(formattedInput);

    if (success) {
      // Only focus the textarea on desktop, not on mobile
      if (!isMobile) {
        focusTextarea();
      } else {
        // On mobile, blur the textarea to dismiss the keyboard
        if (textareaRef.current) {
          textareaRef.current.blur();
        }
      }
    } else {
      // On error, reset the input value
      setValue(currentInput);
      setActiveButton(currentActiveButton);
    }

    setIsSubmitting(false);
  };

  // // Save the current selection state
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
  }; // TODO: Check if this is needed

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
  }; // TODO: Check if this is needed

  const isMobile = false; // TODO: try to remove this dependency outright. might not be possible with all the keyboard listening code
  const focusTextarea = () => {
    if (textareaRef.current && !isMobile) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Mod+Enter on both mobile and desktop
    if (!isSubmitting && e.key === "Enter" && e.metaKey) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }

    // Only handle regular Enter key (without Shift) on desktop
    if (!isSubmitting && !isMobile && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleButton = (button: ActiveButton) => {
    // Save the current selection state before toggling
    saveSelectionState();

    setActiveButton((prev) => (prev === button ? "none" : button));

    // Restore the selection state after toggling
    setTimeout(() => {
      restoreSelectionState();
    }, 0);
  };

  // Model Selection
  const selectedModelDetails: Omit<Model, "id"> | undefined =
    AVAILABLE_MODELS[currentModel];

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div
        ref={inputContainerRef}
        className={cn(
          "relative w-full rounded-3xl border border-gray-200 bg-white p-3 cursor-text",
          isSubmitting && "opacity-80"
        )}
        // onKeyUp={handleInputContainerClick} // TODO: Needed?
      >
        {/* BLUR BORDER ABOVE INPUT */}
        {/* TODO: fix implementation */}
        {/* <div
          className={cn(
            "absolute inset-0 rounded-3xl border border-gray-200 pointer-events-none ",
            "opacity-80 h-[20px] mb-[20px]"
          )}
        ></div> */}

        {/* CHAT INPUT */}
        <div className="mb-8">
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            className={cn(
              "min-fit max-h-[160px] w-full pl-2 pr-4 pt-0 pb-0 border-0",
              "outline-none focus:outline-none focus-visible:outline-none",
              "focus:ring-0 focus-visible:ring-0 focus:shadow-none",
              "focus:border-0 focus-visible:border-0",
              "resize-none overflow-y-auto leading-tight",
              "bg-transparent text-gray-900 placeholder:text-gray-400 placeholder:text-base placeholder:font-normal text-base"
            )}
            value={value}
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
            <div className="flex items-center space-x-2 select-none ">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full h-8 w-8 flex-shrink-0 border-gray-200 p-0 transition-colors",
                  activeButton === "add" && "bg-gray-100 border-gray-300"
                )}
                onClick={() => toggleButton("add")}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
            <div className="flex items-center space-x-2 select-none">
              {/* Model Selection */}
              <Select
                value={currentModel as string}
                onValueChange={(value) => {
                  setCurrentModel(value as ModelId);
                  // TODO: handle support for different models
                  setActiveButton("none");
                  focusTextarea();
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a model" />
                  <SelectValue>
                    {selectedModelDetails && (
                      <div className="flex gap-2">
                        <span className="mt-0.5">
                          {renderCreatorIcon(
                            selectedModelDetails.creator,
                            24
                          )}
                        </span>
                        <span>{selectedModelDetails.name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.entries(AVAILABLE_MODELS).map(([id, model]) => {
                      // const model = { id: id, ...modelValues };
                      return (
                        <>
                          {/* <SelectLabel key={id} className="font-medium text-gray-900">
                                {formatCreatorName(model.creator)}
                              </SelectLabel> */}
                          <SelectItem key={id} value={id}>
                            <div className="flex flex-row gap-2">
                              <div className="">
                                <div className="flex items-center gap-1">
                                  <div className="pl-0.5">
                                    {renderCreatorIcon(model.creator, 24)}
                                  </div>
                                  <span className="font-medium">
                                    {model.name}
                                  </span>
                                  {model.status === ModelStatus.Active && (
                                    <span className="bg-emerald-100 text-emerald-800 text-xs px-1.5 py-0.5 rounded-full">
                                      Active
                                    </span>
                                  )}
                                  {model.status === ModelStatus.Alpha && (
                                    <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full">
                                      Alpha
                                    </span>
                                  )}
                                  {model.status === ModelStatus.Beta && (
                                    <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                                      Beta
                                    </span>
                                  )}
                                  {model.status ===
                                    ModelStatus.Deprecated && (
                                    <span className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 rounded-full">
                                      Deprecated
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {model.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {model.capabilities.map((capability) => (
                                    <Badge
                                      key={capability}
                                      variant="outline"
                                      className="mr-1"
                                    >
                                      {capability}
                                    </Badge>
                                  ))}
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                        </>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full h-8 w-8 border-0 flex-shrink-0 transition-all duration-200",
                  !isSubmitting ? "bg-black scale-110" : "bg-gray-200",
                )}
                disabled={isSubmitting}
              >
                <ArrowUp
                  className={cn(
                    "h-4 w-4 transition-colors",
                    !isSubmitting ? "text-white" : "text-gray-500",
                  )}
                />
                <span className="sr-only">Submit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

const renderCreatorIcon = (creator: string, size: number) => {
  switch (creator) {
    case "google":
      return GetIconFromPath(siGooglegemini.hex, siGooglegemini.path, size);
    case "anthropic":
      return GetIconFromPath(siAnthropic.hex, siAnthropic.path, size);
    case "openai":
      return GetIconFromPath(siOpenai.hex, siOpenai.path, size);
    case "meta":
      return GetIconFromPath(siMeta.hex, siMeta.path, size);
    case "deepseek":
      return null;
    case "alibaba":
      return GetIconFromPath(siAlibabadotcom.hex, siAlibabadotcom.path, size);
    default:
      return null;
  }
};

const GetIconFromPath = (color: string, path: string, size: number) => {
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      fill={"#" + color}
      width={size}
      height={size}
    >
      <path d={path} />
    </svg>
  );
};

// const formatCreatorName = (creator: ModelCreator) => {
//   switch (creator) {
//     case "google":
//       return "Google";
//     case "anthropic":
//       return "Anthropic";
//     case "openai":
//       return "OpenAI";
//     case "meta":
//       return "Meta";
//     case "deepseek":
//       return "DeepSeek";
//     case "alibaba":
//       return "Alibaba";
//     default:
//       return creator;
//   }
// };

// TODO: Re-write everything after updating models
