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
import { formatChatInput, isChatInputValid } from "@/lib/chat";
import { Attachment, useChatsStore } from "@/lib/chat/store";
import type { ActiveButton } from "@/lib/chat/types";
import {
    AVAILABLE_MODELS,
    type Model,
    type ModelId,
    ModelStatus,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowUp, Loader2, Plus, XCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import {
    siAlibabadotcom,
    siAnthropic,
    siGooglegemini,
    siMeta,
    siOpenai,
} from "simple-icons";

interface ChatInputProps {
    sendMessage: (input: string, attachments: Attachment[]) => void;
    isStreaming: boolean;
    placeholder: string;
    /**
     * What to do on submit. Should hold until input is submitted.
     * @param input Input value
     * @returns Whether input was submitted successfully
     */
    // TODO: refactor web logic here

    className?: string;
}

export function ChatInput({
    sendMessage,
    isStreaming,
    placeholder,
    className,
}: ChatInputProps) {
    // UI states
    const activeButton = useChatsStore((state) => state.activeButton);
    const setActiveButton = useChatsStore((state) => state.setActiveButton);
    const currentModel = useChatsStore((state) => state.currentModel);
    const setCurrentModel = useChatsStore((state) => state.setCurrentModel);

    // Current input value
    const value = useChatsStore((state) => state.newChatMessage);
    const setValue = useChatsStore((state) => state.setNewChatMessage);

    // Attachments
    const attachments = useChatsStore((state) => state.attachments);
    const addAttachment = useChatsStore((state) => state.addAttachment);
    const removeAttachment = useChatsStore((state) => state.removeAttachment);
    const clearAttachments = useChatsStore((state) => state.clearAttachments);

    // Loading states
    const error = useChatsStore((state) => state.error);

    const submitDisabled = isStreaming || !isChatInputValid(value);
    const disabled = isStreaming; // entire widget is disabled (ie. model selection, buttons, etc.)

    // Refs
    const isMobile = useChatsStore((state) => state.isMobile);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const inputContainerRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;

        // Only allow input changes when not streaming
        // if (!isStreaming) {
        setValue(newValue);

        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto"; // reset height
            const newHeight = Math.max(
                24,
                Math.min(textarea.scrollHeight, 180),
            );
            textarea.style.height = `${newHeight}px`;
        }
    };

    const focusTextArea = () => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            // TODO: scroll end of chat into view
            // textareaRef.current.scrollIntoView({
            //     behavior: "smooth",
            //     block: "center",
            // });
        }
    };

    useEffect(() => {
        if (textareaRef.current && !isMobile) {
            textareaRef.current.focus();
        }
    }, [isMobile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (submitDisabled) return;

        const currentInput = value;
        const formattedInput = formatChatInput(currentInput);
        // const currentActiveButton = activeButton;

        // Add vibration when message is submitted?
        // navigator.vibrate(50);

        // Reset input
        setValue("");
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${24}px`;
        }
        clearAttachments();

        // setActiveButton("none");

        // Send the message
        await sendMessage(formattedInput, attachments);

        // Only focus the textarea on desktop, not on mobile
        if (!isMobile) {
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        } else {
            // On mobile, blur the textarea to dismiss the keyboard
            if (textareaRef.current) {
                textareaRef.current.blur();
            }
        }
    };

    useEffect(() => {
        // On error, reset the input value
        if (!error) return;
        setValue("");
    }, [error, setValue]);

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

    // Shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // TODO: SEARCH shortcut

        // Handle Mod+Enter on both mobile and desktop
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

    // Paste-listener
    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            // Access the clipboard data
            if (!event.clipboardData) return;
            // TODO: limit number of uploads
            for (const file of event.clipboardData.files) {
                console.debug(
                    `Pasted content: '${file.name}' (${file.type}) of size ${file.size} bytes`,
                );

                if (file.type !== "image/png") {
                    // TODO: other supported file types
                    console.error("Unsupported file type:", file.type);
                    continue;
                }

                // Upload attachment
                // TODO: impl upload

                // Add attachment
                addAttachment({
                    id: crypto.randomUUID(),
                    name: file.name,
                    type: file.type,
                    createdAt: new Date(),
                    file,
                });
            }
        };

        if (textareaRef?.current) {
            textareaRef.current.addEventListener("paste", handlePaste);
        }

        return () => {
            if (textareaRef?.current) {
                textareaRef.current.removeEventListener("paste", handlePaste);
            }
        };
    }, [addAttachment]);

    // Toggle input options
    const toggleButton = (button: ActiveButton) => {
        // Save the current selection state before toggling
        saveSelectionState();

        setActiveButton((prev) => (prev === button ? "none" : button));

        // Restore the selection state after toggling
        setTimeout(() => {
            restoreSelectionState();
        }, 0);
    };

    // Select Model
    const selectedModelDetails: Omit<Model, "id"> | undefined =
        AVAILABLE_MODELS[currentModel];

    return (
        <div
            ref={inputContainerRef}
            className={cn(
                "relative w-full rounded-3xl border border-accent bg-background p-3 cursor-text",
                isStreaming && "opacity-80",
                "max-w-3xl mx-auto",
                className,
            )}
            // onKeyUp={handleInputContainerClick} // TODO: Needed?
        >
            {attachments.length > 0 && (
                <div className="flex">
                    {attachments.map((attachment, _) => (
                        <div
                            key={attachment.id}
                            className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 bg-gray-100 rounded-lg"
                        >
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="w-6 h-6 p-0"
                                onClick={() => removeAttachment(attachment.id)}
                            >
                                <XCircle className="w-4 h-4 text-gray-500" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                {/* BLUR BORDER ABOVE INPUT */}
                {/* TODO: fix implementation */}
                {/* <div
          className={cn(
            "absolute inset-0 rounded-3xl border border-gray-200 pointer-events-none ",
            "opacity-80 h-[20px] mb-[20px]"
          )}
        ></div> */}

                {/* CHAT INPUT */}
                <div className="flex mb-2">
                    <textarea
                        ref={textareaRef}
                        placeholder={placeholder}
                        className={cn(
                            "w-full pl-2 pr-4 pt-0 pb-0 border-0",
                            "outline-none focus:outline-none focus-visible:outline-none",
                            "focus:ring-0 focus-visible:ring-0 focus:shadow-none",
                            "focus:border-0 focus-visible:border-0",
                            "resize-none overflow-y-auto leading-tight",
                            "bg-transparent text-foreground placeholder:text-shadow-foreground placeholder:text-base placeholder:font-normal text-base",
                        )}
                        value={value}
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
                    {isStreaming && (
                        <div className="flex items-center w-10 ml-2 justify-right">
                            <Loader2 className="w-6 h-6 border-2 border-gray-200 rounded-full animate-spin border-t-transparent" />
                        </div>
                    )}
                </div>

                {/* PROMPT OPTIONS */}
                {/* <div className="absolute bottom-3 left-3 right-3"> */}
                <div className="">
                    <div className="flex items-center justify-between">
                        {/* LEFT ISLAND */}
                        <div className="flex items-center space-x-2 select-none ">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className={cn(
                                    "rounded-full h-8 w-8 flex-shrink-0 p-0 transition-colors",
                                    "bg-background hover:bg-accent/80 focus:bg-accent/80",
                                )}
                                onClick={() => toggleButton("add")}
                                disabled={disabled}
                            >
                                <Plus
                                    className={cn("h-4 w-4 text-foreground")}
                                />
                                <span className="sr-only">Add</span>
                            </Button>

                            {/* 
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "rounded-full h-8 px-3 flex items-center gap-1.5 transition-colors",
                                    activeButton === "deepSearch" &&
                                        "bg-accent",
                                )}
                                onClick={() => toggleButton("deepSearch")}
                                disabled={disabled}
                            >
                                <Search
                                    className={cn("h-4 w-4 text-foreground")}
                                />
                                <span
                                    className={cn(
                                        "text-foreground text-sm",
                                        activeButton === "deepSearch" &&
                                            "font-medium",
                                    )}
                                >
                                    DeepSearch
                                </span>
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    "rounded-full h-8 px-3 flex items-center gap-1.5 transition-colors",
                                    activeButton === "think" && "bg-accent",
                                )}
                                onClick={() => toggleButton("think")}
                                disabled={disabled}
                            >
                                <Lightbulb
                                    className={cn("h-4 w-4 text-gray-500")}
                                />
                                <span
                                    className={cn(
                                        "text-foreground text-sm",
                                        activeButton === "think" &&
                                            "font-medium",
                                    )}
                                >
                                    Think
                                </span>
                            </Button> */}
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
                                    focusTextArea();
                                }}
                                disabled={disabled}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select a model" />
                                    <SelectValue>
                                        {selectedModelDetails && (
                                            <div className="flex gap-2">
                                                <span className="mt-0.5">
                                                    {renderCreatorIcon(
                                                        selectedModelDetails.creator,
                                                        24,
                                                    )}
                                                </span>
                                                <span>
                                                    {selectedModelDetails.name}
                                                </span>
                                            </div>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {Object.entries(AVAILABLE_MODELS).map(
                                            ([model_id, model]) => {
                                                // const model = { id: id, ...modelValues };
                                                return (
                                                    <>
                                                        {/* <SelectLabel key={id} className="font-medium text-gray-900">
                                {formatCreatorName(model.creator)}
                              </SelectLabel> */}
                                                        <SelectItem
                                                            key={model_id}
                                                            value={model_id}
                                                        >
                                                            <div
                                                                className="flex flex-row gap-2"
                                                                key={model_id}
                                                            >
                                                                <div
                                                                    className="flex items-center gap-1"
                                                                    key={
                                                                        model_id
                                                                    }
                                                                >
                                                                    <div
                                                                        className="pl-0.5"
                                                                        key={
                                                                            model_id
                                                                        }
                                                                    >
                                                                        {renderCreatorIcon(
                                                                            model.creator,
                                                                            24,
                                                                        )}
                                                                    </div>
                                                                    <span className="font-medium">
                                                                        {
                                                                            model.name
                                                                        }
                                                                    </span>
                                                                    {model.status ===
                                                                        ModelStatus.Active && (
                                                                        <span className="bg-emerald-100 text-emerald-800 text-xs px-1.5 py-0.5 rounded-full">
                                                                            Active
                                                                        </span>
                                                                    )}
                                                                    {model.status ===
                                                                        ModelStatus.Alpha && (
                                                                        <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full">
                                                                            Alpha
                                                                        </span>
                                                                    )}
                                                                    {model.status ===
                                                                        ModelStatus.Beta && (
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
                                                                    {
                                                                        model.description
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    {model.capabilities.map(
                                                                        (
                                                                            capability,
                                                                        ) => (
                                                                            <Badge
                                                                                key={`${model_id}-${capability}`}
                                                                                variant="outline"
                                                                                className="mr-1"
                                                                            >
                                                                                {
                                                                                    capability
                                                                                }
                                                                            </Badge>
                                                                        ),
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </SelectItem>
                                                    </>
                                                );
                                            },
                                        )}
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
                                    !isStreaming
                                        ? "bg-black scale-110"
                                        : "bg-gray-200",
                                )}
                                disabled={submitDisabled}
                            >
                                {/* TODO(ui): abort button */}
                                <ArrowUp
                                    className={cn(
                                        "h-4 w-4 transition-colors",
                                        !isStreaming
                                            ? "text-white"
                                            : "text-gray-500",
                                    )}
                                />
                                <span className="sr-only">Submit</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

const renderCreatorIcon = (creator: string, size: number) => {
    switch (creator) {
        case "google":
            return GetIconFromPath(
                siGooglegemini.hex,
                siGooglegemini.path,
                size,
            );
        case "anthropic":
            return GetIconFromPath(siAnthropic.hex, siAnthropic.path, size);
        case "openai":
            return GetIconFromPath(siOpenai.hex, siOpenai.path, size);
        case "meta":
            return GetIconFromPath(siMeta.hex, siMeta.path, size);
        case "deepseek":
            return null;
        case "alibaba":
            return GetIconFromPath(
                siAlibabadotcom.hex,
                siAlibabadotcom.path,
                size,
            );
        default:
            return null;
    }
};

const GetIconFromPath = (color: string, path: string, size: number) => {
    return (
        <svg
            viewBox={`0 0 ${size} ${size}`}
            xmlns="http://www.w3.org/2000/svg"
            fill={`#${color}`}
            width={size}
            height={size}
        >
            <title>.</title>
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
