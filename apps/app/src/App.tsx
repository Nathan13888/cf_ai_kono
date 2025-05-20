import "./App.css";
import ChatInterface from "./components/dashboard/chat/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <main className="bg-gray-50 overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <ChatInterface />
      </QueryClientProvider>
    </main>
  );
}
