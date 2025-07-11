import type { Chat, Message, MessageId } from "@kono/models";

export type RawChatChunk = string;
export type Section = Message & {
    isStreaming: boolean; // TODO: necessary?
};

export interface StreamBuffer {
    messageId: MessageId;
    words: string[]; // TODO: need to modify for richer document types
    // isStreaming: boolean;
    lastUpdatedAt: number;
    error: string | null;
}

// TODO: Doesn't seem to be used anywhere for real
// TODO: refactor to api
export type ActiveButton = "none" | "add" | "deepSearch" | "think";

export interface ActiveChat extends Chat {
    // streams: StreamBuffer;
}
