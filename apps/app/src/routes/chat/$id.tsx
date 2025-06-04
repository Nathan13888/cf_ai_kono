import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useChatsStore } from "@/lib/chat/store";
import { ChatScreen } from "@/components/dashboard/chat/chat"; // TODO: << move this import
import { ChatInput } from "@/components/dashboard/chat/input"; // TODO: << move this import
import { Chat, ChatId, ChatMetadata, chatSchema, modelIdSchema } from "@kono/models";

// import "./chat.css"; // TODO: << is this needed?
import { useRef, useState } from "react";
import { checkAuthenticated } from '@/lib/auth-client';
import { isChatInputValid } from '@/lib/chat';
import { client } from '@/lib/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Value } from '@sinclair/typebox/value';
import { Router } from 'lucide-react';

// // Constants for layout calculations to account for the padding values
// const TOP_PADDING = 48; // pt-12 (3rem = 48px)
// const BOTTOM_PADDING = 128; // pb-32 (8rem = 128px)
// const ADDITIONAL_OFFSET = 16; // Reduced offset for fine-tuning

export const Route = createFileRoute('/chat/$id')({
  loader: async ({ location, params }) => {
    await checkAuthenticated(location);

    const { id } = params;

    const getActiveChat = useChatsStore((state) => state.getActiveChat);
    const activeChat = await getActiveChat(id);

    if (!activeChat) {
      throw redirect({
        to: "/chat",
      });
    }

    return activeChat;
  },
  component: RouteComponent,
})

function RouteComponent() {
  const chat: ActiveChat = Route.useLoaderData();

  // const queryClient = useQueryClient();
  // const { status, data, error, isFetching } = useQuery({
  //   queryKey: ["chat", id],
  //   queryFn: async () => {
  //     const response = await client.chat[':id'].$get({
  //       param: {
  //         id,
  //       },
  //     })
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch chat");
  //     }
  //     return Value.Parse(chatSchema, await response.json());
  //   },
  // })

  // Global states
  const currentModel = useChatsStore((state) => state.currentModel);

  const [inputValue, setInputValue] = useState("");

  // Check if device is mobile and get viewport height
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // const isMobile = useChatsStore((state) => state.isMobile);
  // const setIsMobile = useChatsStore((state) => state.setIsMobile);
  // const viewportHeight = useChatsStore((state) => state.viewportHeight);
  // const setViewportHeight = useChatsStore((state) => state.setViewportHeight);
  // useEffect(() => {
  //   const checkMobileAndViewport = () => {
  //     const isMobileDevice = window.innerWidth < 768;
  //     setIsMobile(isMobileDevice);

  //     // Capture the viewport height
  //     const vh = window.innerHeight;
  //     setViewportHeight(vh);

  //     // Apply fixed height to main container on mobile
  //     if (isMobileDevice && mainContainerRef.current) {
  //       mainContainerRef.current.style.height = `${vh}px`;
  //     }
  //   };

  //   checkMobileAndViewport();

  //   // Set initial height
  //   if (mainContainerRef.current) {
  //     mainContainerRef.current.style.height = isMobile
  //       ? `${viewportHeight}px`
  //       : "100svh";
  //   }

  //   // Update on resize
  //   window.addEventListener("resize", checkMobileAndViewport);

  //   return () => {
  //     window.removeEventListener("resize", checkMobileAndViewport);
  //   };
  // }, [isMobile, viewportHeight]);

  // Calculate available content height (viewport minus header and input)
  // TODO: impl? idk what it's for Nathan?
  // const getContentHeight = () => {
  //   // Calculate available height by subtracting the top and bottom padding from viewport height
  //   return viewportHeight - TOP_PADDING - BOTTOM_PADDING - ADDITIONAL_OFFSET;
  // };

  return (
    <div className="flex flex-col flex-1 h-full overflow-x-hidden overflow-y-auto bg-gray-50">
        {/* Shadow */}
        {/* <div className="absolute inset-x-0 top-0 z-50 h-4 mt-12 pointer-events-none bg-gradient-to-b from-blue-400/20 to-transparent"></div> */}

        {/* TODO: fix bottom margin to match input height */}
        <ChatScreen className="px-4 mb-48" />

        <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 bg-gray-50">
          <ChatInput
            value={inputValue}
            setValue={setInputValue}
            placeholder={"Say anything..."} // TODO: Update this
            onSubmit={async (input) => {
              // TODO: Implement chat creation logic
              // // Send new chat
              // const newChatResponse = await client.chat.$post({
              //   json: {
              //     content: input,
              //     modelId: currentModel,
              //   }
              // });

              // // If successful, clear the input
              // if (newChatResponse.ok) {
              //   const newChatData = await newChatResponse.json();
              //   router.navigate({
              //     to: "/chat/$id",
              //     params: { id: newChatData.id },
              //   })
              //   return true;
              // } else {
              //   // Handle error
              //   console.error("Failed to create new chat");
              //   return false;
              // }
              return false;
            }}
            disabled={!isChatInputValid(inputValue)} />
        </div>
    </div>
  );
}

// TODO: FInish this ^^
