import type { ActiveChat } from "@/lib/chat/types";
import { cn } from "@/lib/utils";
import { useRef } from "react";

// TODO: Re-write everything after updating models

export interface ChatScreenProps extends React.HTMLProps<HTMLDivElement> {
    activeChat: ActiveChat;
}

export function ChatScreen({
    activeChat,
    className,
    ...props
}: ChatScreenProps) {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    //   const newSectionRef = useRef<HTMLDivElement>(null);
    //   const messagesEndRef = useRef<HTMLDivElement>(null);

    //   const textareaRef = useRef<HTMLTextAreaElement>(null);
    //   const isMobile = useChatsStore((state) => state.isMobile);

    //   const id = useChatsStore((state) => state.currentChat?.id);
    //   const currentSections = useChatsStore(
    //     (state) => state.currentChat?.sections
    //   );
    //   const isStreaming = useChatsStore((state) => state.isStreaming);
    //   const streamBuffer = useChatsStore((state) => state.streamBuffer);

    //   // Get current chat chat
    //   // const {data} = queryOptions({
    //   //   // TODO: validate changing id is alright??
    //   //   queryKey: ["message", id],
    //   //   queryFn: streamedQuery({
    //   //     queryFn:
    //   //   }),
    //   // });

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

    return (
        <div
            ref={chatContainerRef}
            className={cn("relative flex-1", className)}
        >
            {/* TODO: FInish this */}
        </div>
    );
}

// const timeAgoString = (timestamp: number) => {
//   const date = new Date(timestamp);
//   const [timeAgo, setTimeAgo] = useState("");

//   useEffect(() => {
//     const updateTimeAgo = () => {
//       setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
//     };

//     // Initial update
//     updateTimeAgo();

//     const intervalId = setInterval(updateTimeAgo, 1000); // Update every 1 second
//     return () => clearInterval(intervalId);
//   }, []);

//   return <span>{timeAgo}</span>;
// };
