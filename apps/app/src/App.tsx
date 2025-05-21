import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import ChatInterface from "./components/dashboard/chat/page";

const queryClient = new QueryClient();

export default function App() {
  return (
    <main className="flex flex-col w-full h-screen overflow-hidden bg-gray-50 overscroll-none touch-none">
      <QueryClientProvider client={queryClient}>
        <ChatInterface />
      </QueryClientProvider>
    </main>
  );
}
