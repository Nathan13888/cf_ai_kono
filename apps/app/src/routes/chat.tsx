import { createFileRoute } from '@tanstack/react-router'
import ChatInterface from "@/components/dashboard/chat/page";

export const Route = createFileRoute('/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ChatInterface />
}
