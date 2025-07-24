import {
    type Chat,
    type ChatId,
    type ChatMetadata,
    type ModelId,
    type SendChatByIdResponse,
    chatMetadataSchema,
    chatSchema,
    sendChatByIdResponseSchema,
} from "@kono/models";
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { client } from "../client";

export async function getChatHistory(): Promise<ChatMetadata[] | null> {
    const response = await client.chat.$get();
    if (!response.ok) {
        console.error("Failed to fetch chat history", await response.text());
    }

    // Parse the response
    try {
        const body = await response.json();
        const chats = Value.Parse(Type.Array(chatMetadataSchema), body);
        return chats;
    } catch (e) {
        console.error("Failed to parse chat history", e);
        // TODO: fix error handling
        return null;
    }
}

export async function newChat(): Promise<string | null> {
    // Request for new chat
    const response = await client.chat.$post({
        json: {},
    });

    if (!response.ok) {
        console.error("Failed to create new chat", await response.text());
        // state.error = "Failed to create new chat";
        // TODO: fix error handling
        return null;
    }

    // Parse the response
    try {
        const body = await response.json();
        const chat = Value.Parse(chatSchema, body);
        // state.currentChat = chat;
        return chat.id;
    } catch (e) {
        console.error("Failed to parse new chat", e);
        // state.error = "Failed to parse new chat";
        // TODO: fix error handling
        return null;
    }
}

export async function getChatById(chatId: string): Promise<Chat | null> {
    const response = await client.chat[":id"].$get({
        param: {
            id: chatId,
        },
    });
    if (!response.ok) {
        console.error(
            `Failed to fetch chat "${chatId}"`,
            await response.text(),
        );
        // TODO: fix error handling
        return null;
    }

    try {
        const body = await response.json();
        const parsed = Value.Parse(chatSchema, body);
        return parsed;
    } catch (e) {
        console.error(`Failed to parse chat "${chatId}"`, e);
        return null;
    }
}

export async function messageChat(
    chatId: ChatId,
    // TODO: refactor to schema request type
    message: string,
    modelId: ModelId,
): Promise<SendChatByIdResponse | null> {
    // query api
    const response = await client.chat[":id"].$post({
        param: {
            id: chatId,
        },
        json: {
            content: message,
            modelId,
        },
    });

    if (!response.ok) {
        console.error(
            `Failed to send message to chat "${chatId}"`,
            await response.text(),
        );
        // TODO: fix error handling
        return null;
    }

    // Update the current chat with the new message
    try {
        const body = await response.json();
        const parsed = Value.Parse(sendChatByIdResponseSchema, body);
        return parsed;
    } catch (e) {
        console.error(`Failed to parse response for chat "${chatId}"`, e);
        // TODO: fix error handling
        return null;
    }
}

export async function streamMessage(
    messageId: string,
    onChunk: (chunk: string) => void,
): Promise<void> {
    const response = await client.message[":id"].stream.$get({
        param: {
            id: messageId,
        },
    });

    if (!response.ok) {
        const errorMsg = await response.text(); // TODO: parse error message
        console.error(
            `Failed to stream message "${messageId} with error: ${errorMsg}`,
        );
        // TODO: handle error
        return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
        console.error(`Failed to get reader for message "${messageId}"`);
    }

    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
        if (!reader) {
            console.error(`Reader is not available for message "${messageId}"`);
            return;
        }

        const { value, done: isDone } = await reader.read();
        done = isDone;
        if (value) {
            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
        }
    }
    // Close the reader
    reader?.releaseLock();
}
