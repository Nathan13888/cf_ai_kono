import type { Chat, Message, MessageId } from "@kono/models";

export type Section = Message & {
  isStreaming: boolean; // TODO: necessary?
}

export interface StreamBuffer {
  messageId: MessageId;
  words: string[]; // TODO: need to modify for richer document types
  // isStreaming: boolean;
  lastUpdatedAt: number;
  error: string | null;
}

export type ActiveButton = "none" | "add" | "deepSearch" | "think"; // TODO: Doesn't seem to be used anywhere for real

export interface ActiveChat extends Chat {
  streams: StreamBuffer,
}

export type ActiveChatWithoutId = Omit<ActiveChat, "id">;
