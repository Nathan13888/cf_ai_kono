import ChatHeader from "@/components/dashboard/chat/header";
import { checkAuthenticated } from "@/lib/auth-client";
import { useCreateChat } from "@/lib/chat/route";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chat/")({
    beforeLoad: async ({ location }) => checkAuthenticated(location),
    component: RouteComponent,
});

function RouteComponent() {
    const createChat = useCreateChat();

    return (
        <div className="relative flex-1 overflow-hidden h-[100svh] lg:h-screen antialiased bg-gray-50 full-size overflow-none">
            <ChatHeader createChat={createChat} />

            <Outlet />
        </div>
    );
}
