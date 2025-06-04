import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";

import { ProfileButton } from "@/components/ui/profile-button";

export const Route = createFileRoute('/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter();
const handleNewChat = () => {
    router.navigate({
      to: "/chat",
    })
  }

//   const currentChat: Chat | null | undefined = undefined; // TODO: fetch chat by id
//   const chatTitle = useCallback(() => currentChat?.title, [currentChat]);

  return (
    <div
      className="relative flex-1 overflow-hidden h-[100svh] lg:h-screen antialiased bg-gray-50 full-size overflow-none"
    >
        <header className="fixed top-0 left-0 right-0 z-20 flex items-center h-12 bg-gray-50">
            <div className="flex items-center justify-between w-full px-2">
            {/* Sidebar Menu (commented out for now) */}
            {/*
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                <Menu className="w-5 h-5 text-gray-700" />
                <span className="sr-only">Menu</span>
            </Button>
            */}

            {/* New Chat */}
            <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full mr-2"
                onClick={handleNewChat}
            >
                <PenSquare className="w-5 h-5 text-gray-700" />
                <span className="sr-only">New Chat</span>
            </Button>

            {/* Chat Title */}
            {/* <h1 className="flex-1 text-base font-medium text-gray-800 text-center">
                {chatTitle() ?? "New Chat"}
            </h1> */}
            
            {/* Right item */}
            <ProfileButton />
            </div>
        </header>
        <Outlet />
    </div>
  )
}
