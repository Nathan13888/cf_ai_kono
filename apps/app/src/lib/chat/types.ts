export type ConversationID = string;

export interface Conversation {
  id: ConversationID;
  title: string | null;
  sections: Section[];

  // usage metadata
  lastUpdatedAt: number | null;
  // TODO: ???
}

export interface Section {
  id: string;
  thinking: ThinkingStep[] | null;
  messages: Message[];

  createdAt: number;
  generationTime: number | null;
  isRendering: boolean;
}

export type MessageType = "user" | "assistant" | "system";
export interface Message {
  id: string;
  content: Chunk[] | string | null;
  type: MessageType;

  // NOTE: each section should have at most one non-completed message
  completed: boolean | null;
  // newSection: boolean | null;
}

// TODO: fix impl
export interface ThinkingStep {
  id: string;
  name: string;
  content: string;
}

export interface Chunk {
  id: string;
  text: string;
}

export interface StreamBuffer {
  id: ConversationID;
  messageId: string;
  words: Chunk[];
  // isRendering: boolean;
  lastUpdatedAt: number;
  error: string | null;
}

export type ActiveButton = "none" | "add" | "deepSearch" | "think";
