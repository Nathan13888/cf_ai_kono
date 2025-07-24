import { useChatsStore } from "@/lib/chat/store";
import { cn } from "@/lib/utils";
import type { ChatMetadata } from "@kono/models";

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

    if (!isMenuOpen) {
        return null; // Don't render the menu if it's not open
    }

    // const isMobile = useChatsStore((state) => state.isMobile);
    // const setMobile = useChatsStore((state) => state.setIsMobile);
    // const openMenu = useChatsStore((state) => state.openMenu);
    // const closeMenu = useChatsStore((state) => state.closeMenu);

    // Automatically open and close based on screen size
    // useEffect(() => {
    //     if (mainContainerRef?.current) {
    //         const isMobile = window.innerWidth < 768;
    //         if (isMobile) {
    //             // Close menu on mobile
    //             // setMobile(true);
    //             closeMenu();
    //         } else {
    //             // Open menu on desktop
    //             // setMobile(false);
    //             openMenu();
    //         }
    //     }
    // }, [mainContainerRef, openMenu, closeMenu]);

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
