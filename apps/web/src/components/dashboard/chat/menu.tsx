import { useChatsStore } from "@/lib/chat/store";
import { cn } from "@/lib/utils";
import type { ChatMetadata } from "@kono/models";
import { useEffect } from "react";

export default function ChatMenu({
    history,
    navigateToChat,
    mainContainerRef,
    className,
}: {
    history: ChatMetadata[];
    navigateToChat: (id: string) => void;
    mainContainerRef: React.RefObject<HTMLDivElement>;
    className?: string;
}) {
    const isMenuOpen = useChatsStore((state) => state.isMenuOpen);
    const setIsMobile = useChatsStore((state) => state.setIsMobile);
    const closeMenu = useChatsStore((state) => state.closeMenu);

    // Automatically open and close based on screen size
    useEffect(() => {
        const autoResize = () => {
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                // Close menu on mobile
                setIsMobile(true);
                closeMenu();
            }
        };

        // first check
        autoResize();

        // listener
        window.addEventListener("resize", autoResize);
        return () => {
            window.removeEventListener("resize", autoResize);
        };
    }, [closeMenu, setIsMobile]);

    if (!isMenuOpen) {
        return null; // Don't render the menu if it's not open
    }

    return (
        <div
            className={cn(
                "flex flex-col w-64 h-full bg-background border-r",
                className,
            )}
        >
            {/* <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Kono Chat</h2>
            </div> */}
            <div className="flex h-12" />
            {/* Search Bar */}
            {/* TODO(ui): impl search */}

            {/* Chat History */}
            {/* TODO(ui): time ago */}
            {history.length > 0 ? (
                <div className="flex-1 overflow-hidden hover:overflow-y-auto">
                    {history.map((chat) => (
                        <button
                            key={chat.id}
                            type="button"
                            className="w-full p-4 text-xs text-left cursor-pointer hover:bg-gray-100"
                            onClick={() => navigateToChat(chat.id)}
                        >
                            {chat.title || "Untitled Chat"}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center flex-1">
                    <p className="text-gray-500">No chats found</p>
                </div>
            )}
        </div>
    );
}
