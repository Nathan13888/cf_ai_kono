"use client";

// import "./chat.css";

import { Button } from "@/components/ui/button";
import { useChatsStore } from "@/lib/chat/store";
import { PenSquare } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import Chat from "./chat";
import ChatInput from "./input";
import { ProfileButton } from "@/components/ui/profile-button";
import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

// // Constants for layout calculations to account for the padding values
// const TOP_PADDING = 48; // pt-12 (3rem = 48px)
// const BOTTOM_PADDING = 128; // pb-32 (8rem = 128px)
// const ADDITIONAL_OFFSET = 16; // Reduced offset for fine-tuning

export default function ChatInference() {
  // Check user status
  const { 
    data: session, 
    isPending,
    error,
  } = authClient.useSession();
  const isLoggedIn = useCallback(
    () => session !== null && session !== undefined && !isPending && !error,
    [session, isPending, error]);

  // Check if device is mobile and get viewport height
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useChatsStore((state) => state.isMobile);
  const setIsMobile = useChatsStore((state) => state.setIsMobile);
  const viewportHeight = useChatsStore((state) => state.viewportHeight);
  const setViewportHeight = useChatsStore((state) => state.setViewportHeight);
  useEffect(() => {
    const checkMobileAndViewport = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);

      // Capture the viewport height
      const vh = window.innerHeight;
      setViewportHeight(vh);

      // Apply fixed height to main container on mobile
      if (isMobileDevice && mainContainerRef.current) {
        mainContainerRef.current.style.height = `${vh}px`;
      }
    };

    checkMobileAndViewport();

    // Set initial height
    if (mainContainerRef.current) {
      mainContainerRef.current.style.height = isMobile
        ? `${viewportHeight}px`
        : "100svh";
    }

    // Update on resize
    window.addEventListener("resize", checkMobileAndViewport);

    return () => {
      window.removeEventListener("resize", checkMobileAndViewport);
    };
  }, [isMobile, viewportHeight]);

  // Calculate available content height (viewport minus header and input)
  // TODO: impl? idk what it's for Nathan?
  // const getContentHeight = () => {
  //   // Calculate available height by subtracting the top and bottom padding from viewport height
  //   return viewportHeight - TOP_PADDING - BOTTOM_PADDING - ADDITIONAL_OFFSET;
  // };

  const conversationTitle = useChatsStore(
    (state) => state.currentConversation?.title
  );
  const newChat = useChatsStore((state) => state.newChat);

  return (
    <div
      ref={mainContainerRef}
      className="relative flex-1 overflow-hidden antialiased bg-gray-50 full-size overflow-none"
      style={{ height: isMobile ? `${viewportHeight}px` : "100svh" }}
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
            onClick={(_) => newChat()}
          >
            <PenSquare className="w-5 h-5 text-gray-700" />
            <span className="sr-only">New Chat</span>
          </Button>

          {/* Chat Title */}
          <h1 className="flex-1 text-base font-medium text-gray-800 text-center">
            {conversationTitle ? conversationTitle : "New Chat"}
          </h1>
          
          {/* Right item */}
          {
            isLoggedIn ? (
              <ProfileButton />
            ) : (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full">
                  <Link to="/login">
                    Login
                  </Link>
              </Button>
            )
          }
        </div>
      </header>

      <div className="flex flex-col flex-1 h-full overflow-x-hidden overflow-y-auto bg-gray-50">
        {/* Shadow */}
        {/* <div className="absolute inset-x-0 top-0 z-50 h-4 mt-12 pointer-events-none bg-gradient-to-b from-blue-400/20 to-transparent"></div> */}

        {/* TODO: fix bottom margin to match input height */}
        <Chat className="px-4 mb-48" />

        <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 bg-gray-50">
          <ChatInput />
        </div>
      </div>
    </div>
  );
}
