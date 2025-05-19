"use client";

// import "./chat.css";

import { Button } from "@/components/ui/button";
import { useChatsStore } from "@/lib/chat/store";
import { Menu, PenSquare } from "lucide-react";
import { useEffect, useRef } from "react";
import Chat from "./chat";
import ChatInput from "./input";

// Constants for layout calculations to account for the padding values
const TOP_PADDING = 48; // pt-12 (3rem = 48px)
const BOTTOM_PADDING = 128; // pb-32 (8rem = 128px)
const ADDITIONAL_OFFSET = 16; // Reduced offset for fine-tuning

export interface ChatInterfaceProperties {}

export default function ChatInference(props: ChatInterfaceProperties) {
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
  // TODO: impl?
  const getContentHeight = () => {
    // Calculate available height by subtracting the top and bottom padding from viewport height
    return viewportHeight - TOP_PADDING - BOTTOM_PADDING - ADDITIONAL_OFFSET;
  };

  const conversationTitle = useChatsStore(
    (state) => state.currentConversation?.title
  );
  const newChat = useChatsStore((state) => state.newChat);

  return (
    <div
      ref={mainContainerRef}
      className="bg-gray-50 flex flex-col overflow-hidden"
      style={{ height: isMobile ? `${viewportHeight}px` : "100svh" }}
    >
      <header className="fixed top-0 left-0 right-0 h-12 flex items-center px-4 z-20 bg-gray-50">
        <div className="w-full flex items-center justify-between px-2">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <Menu className="h-5 w-5 text-gray-700" />
            <span className="sr-only">Menu</span>
          </Button>

          <h1 className="text-base font-medium text-gray-800">
            {conversationTitle ? conversationTitle : "New Chat"}
          </h1>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={(_) => newChat()}
          >
            <PenSquare className="h-5 w-5 text-gray-700" />
            <span className="sr-only">New Chat</span>
          </Button>
        </div>
      </header>

      <Chat />

      <ChatInput />
    </div>
  );
}
