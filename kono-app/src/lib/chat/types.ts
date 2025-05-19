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
  messages: Message[];

  date: string;
  generationTime: number | null;
  isRendering: boolean;
}

export type MessageType = "user" | "system";
export interface Message {
  id: string;
  thinking: ThinkingStep[] | null;
  content: Chunk[] | string | null;
  type: MessageType;

  completed: boolean | null;
  newSection: boolean | null;
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
