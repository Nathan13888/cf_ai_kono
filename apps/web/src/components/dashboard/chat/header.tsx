import { Button } from "@/components/ui/button";
import { ProfileButton } from "@/components/ui/profile-button";
import { useChatsStore } from "@/lib/chat/store";
import { cn } from "@/lib/utils";
import { Menu, PenSquare } from "lucide-react";

export default function ChatHeader({
    createChat,
    className,
}: { createChat: () => Promise<void>; className?: string }) {
    const chatTitle = useChatsStore((state) => state.currentChat?.title);

    const toggleMenu = useChatsStore((state) => state.toggleMenu);

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 flex items-center",
                className,
            )}
        >
            <div className="flex items-center justify-between w-full px-2">
                {/* Toggle Menu  */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full"
                    onClick={toggleMenu}
                >
                    <Menu className="w-5 h-5 text-gray-700" />
                    <span className="sr-only">Menu</span>
                </Button>
                {/* TODO(ui): open and closed states */}
                {/* TODO(ui): open => just button */}
                {/* TODO(ui): closed => button + new chat + search */}

                {/* New Chat */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 mr-2 rounded-full"
                    onClick={async () => {
                        await createChat();
                    }}
                >
                    <PenSquare className="w-5 h-5 text-gray-700" />
                    <span className="sr-only">New Chat</span>
                </Button>

                {/* Chat Title */}
                <h1 className="flex-1 text-base font-medium text-center text-gray-800">
                    {chatTitle ?? ""}
                </h1>

                {/* Right item */}
                <ProfileButton />
            </div>
        </header>
    );
}
