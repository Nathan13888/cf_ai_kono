import { Button } from "@/components/ui/button";
import { useChatsStore } from "@/lib/chat/store";
import { cn } from "@/lib/utils";
import type { ChatMetadata } from "@kono/models";
import { MessageSquare, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
    const currentChat = useChatsStore((state) => state.currentChat);

    const [searchQuery, setSearchQuery] = useState("");

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

    // Filter chats based on search query
    const filteredHistory = useMemo(() => {
        if (!searchQuery.trim()) return history;

        return history.filter((chat) =>
            (chat.title || "Untitled Chat")
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
        );
    }, [history, searchQuery]);

    // Group chats by date
    const groupedChats = useMemo(() => {
        const groups: { [key: string]: ChatMetadata[] } = {};
        const now = new Date();
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        for (const chat of filteredHistory) {
            const chatDate = new Date(chat.lastUpdatedAt);
            const chatDateOnly = new Date(
                chatDate.getFullYear(),
                chatDate.getMonth(),
                chatDate.getDate(),
            );

            if (chatDateOnly.getTime() === today.getTime()) {
                // biome-ignore lint/complexity/useLiteralKeys: <explanation>
                if (!groups["Today"]) groups["Today"] = [];
                // biome-ignore lint/complexity/useLiteralKeys: <explanation>
                groups["Today"].push(chat);
            } else if (chatDateOnly.getTime() === yesterday.getTime()) {
                // biome-ignore lint/complexity/useLiteralKeys: <explanation>
                if (!groups["Yesterday"]) groups["Yesterday"] = [];
                // biome-ignore lint/complexity/useLiteralKeys: <explanation>
                groups["Yesterday"].push(chat);
            } else if (chatDateOnly >= lastWeek) {
                if (!groups["Last 7 days"]) groups["Last 7 days"] = [];
                groups["Last 7 days"].push(chat);
            } else {
                // biome-ignore lint/complexity/useLiteralKeys: <explanation>
                if (!groups["Older"]) groups["Older"] = [];
                // biome-ignore lint/complexity/useLiteralKeys: <explanation>
                groups["Older"].push(chat);
            }
        }

        return groups;
    }, [filteredHistory]);

    if (!isMenuOpen) {
        return null; // Don't render the menu if it's not open
    }

    return (
        <div
            className={cn(
                "flex flex-col w-72 h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border/40 shadow-sm",
                className,
            )}
        >
            {/* Header spacing to match chat header */}
            <div className="flex-shrink-0 h-12" />

            {/* Search Bar */}
            <div className="px-3 py-2 border-b border-border/40">
                <div className="relative">
                    <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-2 pl-10 pr-4 text-sm transition-all border rounded-md bg-muted/30 border-border/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40">
                    {Object.keys(groupedChats).length > 0 ? (
                        <div className="py-2">
                            {Object.entries(groupedChats).map(
                                ([groupName, chats]) => (
                                    <div key={groupName} className="mb-4">
                                        <div className="px-3 py-1 mb-1">
                                            <h3 className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                                                {groupName}
                                            </h3>
                                        </div>
                                        <div className="px-2 space-y-1">
                                            {chats.map((chat) => {
                                                const isActive =
                                                    currentChat?.id === chat.id;
                                                return (
                                                    <Button
                                                        key={chat.id}
                                                        variant="ghost"
                                                        className={cn(
                                                            "w-full justify-start h-auto p-2 text-left transition-all duration-200 group relative overflow-hidden",
                                                            isActive
                                                                ? "bg-accent/70 text-accent-foreground shadow-sm border border-accent/20"
                                                                : "hover:bg-accent/50 hover:text-accent-foreground",
                                                        )}
                                                        onClick={() =>
                                                            navigateToChat(
                                                                chat.id,
                                                            )
                                                        }
                                                    >
                                                        <div className="flex items-start w-full min-w-0 gap-2">
                                                            <MessageSquare
                                                                className={cn(
                                                                    "w-4 h-4 mt-0.5 flex-shrink-0 transition-colors",
                                                                    isActive
                                                                        ? "text-accent-foreground"
                                                                        : "text-muted-foreground group-hover:text-accent-foreground",
                                                                )}
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p
                                                                    className={cn(
                                                                        "text-sm font-medium truncate transition-colors",
                                                                        isActive
                                                                            ? "text-accent-foreground"
                                                                            : "text-foreground group-hover:text-accent-foreground",
                                                                    )}
                                                                >
                                                                    {chat.title ||
                                                                        "Untitled Chat"}
                                                                </p>
                                                                <p
                                                                    className={cn(
                                                                        "text-xs truncate transition-colors",
                                                                        isActive
                                                                            ? "text-accent-foreground/70"
                                                                            : "text-muted-foreground group-hover:text-accent-foreground/70",
                                                                    )}
                                                                >
                                                                    {new Date(
                                                                        chat.lastUpdatedAt,
                                                                    ).toLocaleTimeString(
                                                                        [],
                                                                        {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        },
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {isActive && (
                                                            <div className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary" />
                                                        )}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                            <MessageSquare className="w-12 h-12 mb-3 text-muted-foreground/40" />
                            <p className="mb-1 text-sm font-medium text-muted-foreground">
                                {searchQuery.trim()
                                    ? "No chats found"
                                    : "No chats yet"}
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                                {searchQuery.trim()
                                    ? "Try adjusting your search"
                                    : "Start a conversation to see your chats here"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
