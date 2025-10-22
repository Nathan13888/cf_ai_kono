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
import type { Attachment } from "./store";

export async function getChatHistory(): Promise<ChatMetadata[] | null> {
    const response = await client.chat.$get();
    if (!response.ok) {
        console.error("Failed to fetch chat history", await response.text());
        return null;
    }

    // Parse the response
    const text = await response.text();
    try {
        const chats = Value.Parse(
            Type.Array(chatMetadataSchema),
            JSON.parse(text),
        );
        return chats;
    } catch (e) {
        console.error("Failed to parse chat history", e, text);
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

    const text = await response.text();
    try {
        const parsed = Value.Parse(chatSchema, JSON.parse(text));
        return parsed;
    } catch (e) {
        console.error(`Failed to parse chat "${chatId}"`, e, text);
        return null;
    }
}

export async function messageChat(
    id: ChatId,
    // TODO: refactor to schema request type
    message: string,
    attachments: Attachment[],
    modelId: ModelId,
): Promise<SendChatByIdResponse | null> {
    // query api
    const response = await client.chat[":id"].$post({
        param: {
            id,
        },
        json: {
            content: message,
            attachments: await Promise.all(
                attachments.map(async (attachment) => {
                    const arrayBuffer = await attachment.file.arrayBuffer();
                    const uint8Array = new Uint8Array(arrayBuffer);
                    let binaryString = "";
                    for (let i = 0; i < uint8Array.length; i++) {
                        binaryString += String.fromCharCode(uint8Array[i]);
                    }
                    const base64 = btoa(binaryString);
                    return base64;
                }),
            ),
            modelId,
        },
    });

    if (!response.ok) {
        console.error(
            `Failed to send message to chat "${id}"`,
            await response.text(),
        );
        // TODO: fix error handling
        return null;
    }

    // Update the current chat with the new message
    const text = await response.text();
    try {
        const parsed = Value.Parse(
            sendChatByIdResponseSchema,
            JSON.parse(text),
        );
        return parsed;
    } catch (e) {
        console.error(`Failed to parse response for chat "${id}"`, e, text);
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

export async function upload(file: File) {
    // TODO: impl
}
