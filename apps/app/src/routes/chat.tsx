import ChatInterface from "@/components/dashboard/chat/page";
import { checkAuthenticated } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
  beforeLoad: async ({ location }) => checkAuthenticated(location),
  component: RouteComponent,
});

function RouteComponent() {
  return <ChatInterface />;
}
