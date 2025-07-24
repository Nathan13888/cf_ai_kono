import { checkAuthenticated } from "@/lib/auth-client";
import ChatPage from "@/pages/chat";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chat/$id")({
    beforeLoad: async ({ location }) => checkAuthenticated(location),
    component: RouteComponent,
});

function RouteComponent() {
    const { id: chatId } = Route.useParams();
    return <ChatPage chatId={chatId} />;
}
