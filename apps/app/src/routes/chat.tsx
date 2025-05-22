import ChatInterface from "@/components/dashboard/chat/page";
import { isAuthenticated } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
  loader: async ({ location }) => {
    // TODO: Extract this common logic to a middleware of some sort?
    if (!(await isAuthenticated())) {
      // Not logged in
      redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
        throw: true,
      })
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <ChatInterface />;
}
