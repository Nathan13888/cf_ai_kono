import {ChatInput} from "@/components/dashboard/chat/input";
import { checkAuthenticated } from "@/lib/auth-client";
import { isChatInputValid } from "@/lib/chat";
import { useChatsStore } from "@/lib/chat/store";
import { client } from "@/lib/client";
import { createFileRoute, useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/chat/")({
  beforeLoad: async ({ location }) => checkAuthenticated(location),
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  // Global states
  const newChatMessage = useChatsStore((state) => state.newChatMessage);
  const setNewChatMessage = useChatsStore((state) => state.setNewChatMessage);
  const currentModel = useChatsStore((state) => state.currentModel);

  return (
    // TODO: Style
    <div
      className="relative flex-1 overflow-hidden h-[100svh] lg:h-screen antialiased bg-gray-50 full-size overflow-none"
    >
      <div className="flex flex-col flex-1 h-full overflow-x-hidden overflow-y-auto bg-gray-50">
        {/* Shadow */}
        {/* <div className="absolute inset-x-0 top-0 z-50 h-4 mt-12 pointer-events-none bg-gradient-to-b from-blue-400/20 to-transparent"></div> */}

        {/* TODO: fix bottom margin to match input height */}
        {/* <ChatScreen className="px-4 mb-48" /> */}

        <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 bg-gray-50">
          <ChatInput
            value={newChatMessage}
            setValue={setNewChatMessage}
            placeholder={"Say anything..."} // TODO: Update this
            onSubmit={async (input) => {
              // Create new chat
              const newChatResponse = await client.chat.$post({
                json: {
                  content: input,
                  modelId: currentModel,
                }
              });

              // If successful, clear the input
              if (newChatResponse.ok) {
                const newChatData = await newChatResponse.json();
                router.navigate({
                  to: "/chat/$id",
                  params: { id: newChatData.id },
                })
                return true;
              } else  {
                // Handle error
                const status = await newChatResponse.text();
                console.error("Failed to create new chat", status);
                // TODO: Show toast
                return false;
              }
            }}
            disabled={!isChatInputValid(newChatMessage)} />
        </div>
      </div>
    </div>
  )
}
