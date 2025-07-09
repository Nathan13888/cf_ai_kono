import {
    type Message,
    type ModelId,
    regenerateMessageByIdResponseSchema,
    requestMessageByIdResponseSchema,
    sendMessageByIdRequestSchema,
    sendMessageByIdResponseSchema,
} from "@kono/models";
import { Type } from "@sinclair/typebox";
import {
    type CoreAssistantMessage,
    type CoreMessage,
    type CoreSystemMessage,
    type CoreUserMessage,
    type LanguageModelV1,
    streamText,
} from "ai";
import { eq } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/typebox";
import { streamText as stream } from "hono/streaming";
import type { AuthType } from "../auth";
import type { Bindings } from "../bindings";
import type { DbBindings } from "../db";
import { messages } from "../db/schema";
import { modelIdToLM } from "../utils/chat";

const streamResponse = async (
    c: Context,
    model: LanguageModelV1,
    messageHistory: CoreMessage[],
    newMessageId: string,
) => {
    const db = c.get("db");

    // Start streaming response
    // TODO(justy): check message history construction is correct
    const result = await streamText({
        model: model,
        // system: "", // TODO: Make system prompt configurable
        messages: messageHistory,
    });
    const { textStream } = result;
    // TODO: Use other bits of the stream result for things like counting usage.
    // const { usage } = result;

    c.header("Content-Encoding", "Identity");
    return stream(
        c,
        async (stream) => {
            // TODO(justy): implement Durable Objects for coordination of streaming response
            const startTime = Date.now();
            const message = [];
            let messageLengthSinceLastSave = 0;
            for await (const textPart of textStream) {
                // TODO: implement aborting, remember to save to db

                // Update full message content
                message.push(textPart);
                messageLengthSinceLastSave += textPart.length;

                // Write the partial update to stream
                await stream.write(textPart);

                // Insert/update message in db
                if (messageLengthSinceLastSave > 50) {
                    await db
                        .update(messages)
                        .set({
                            content: message.join(""),
                            status: "in_progress",
                            generationTime: Date.now() - startTime,
                        })
                        .where(eq(messages.id, newMessageId));
                    messageLengthSinceLastSave = 0;
                }
            }

            // TODO(justy): fix logging
            console.log("message:", message.join(""));

            // Finalize the message
            await db
                .update(messages)
                .set({
                    content: message.join(""),
                    status: "completed",
                    // generationTime: Date.now() - startTime,
                })
                .where(eq(messages.id, newMessageId));
        },
        async (err, stream) => {
            // TODO: handle error display to user
            // TODO: Clean up properly if either client or model API drops
            stream.writeln("An error occurred!");
            console.error(err);
        },
    );
};

const app = new Hono<{ Bindings: Bindings; Variables: DbBindings & AuthType }>()
    .post(
        "/:id",
        describeRoute({
            summary: "Send message to reply",
            // description: ,
            // parameters:
            // validateResponse: true,
            responses: {
                200: {
                    description: "Successful response",
                    content: {
                        // TODO(justy): stream response doesn't seem to be this?
                        "application/json": {
                            schema: resolver(sendMessageByIdResponseSchema),
                        },
                    },
                },
                400: {
                    description: "Bad request",
                    content: {
                        "text/json": {
                            schema: Type.Object({
                                error: Type.String(),
                            }),
                        },
                    },
                },
                401: {
                    description: "Unauthorized",
                },
            },
        }),
        validator("json", sendMessageByIdRequestSchema),
        async (c) => {
            // Check if user is authenticated
            // TODO: refactor auth to middleware for all routes
            const user = c.get("user");
            if (!user) {
                return c.json(
                    {
                        error: "Unauthorized",
                    },
                    401,
                );
            }

            // Fetch request body
            const body = c.req.valid("json");
            const { content, modelId } = body;

            // Check model exists
            const model = modelIdToLM(modelId);
            if (!model) {
                return c.json(
                    {
                        error: `Model ${modelId} not found`,
                    },
                    400,
                );
            }

            const { id } = c.req.param();
            const db = c.get("db");

            // Query for existing parent message
            const existingMessage = await db.query.messages.findFirst({
                where: (messages, { eq }) => eq(messages.id, id),
            });

            if (!existingMessage) {
                return c.json(
                    {
                        error: `Message with ID ${id} not found`,
                    },
                    404,
                );
            }

            // Check if the message is already being processed
            // TODO: impl
            // TODO: use transaction to ensure atomicity

            // Check if the message is not a user name
            if (existingMessage.role === "user") {
                return c.json({
                    error: `Message with ID ${id} is a user message and cannot be replied to`,
                });
            }

            const chatId = existingMessage.chatId;

            // Check if chat exists
            // const chat = await db.query.chats.findFirst({
            //     where: (chats, { eq }) => eq(chats.id, id),
            // });
            // if (!chat) {
            //     return c.json(
            //         {
            //             error: `Chat with ID ${id} not found`,
            //         },
            //         404,
            //     );
            // }
            // TODO: check if user is creator of the chat

            // Initialize new user message in history and db
            // TODO: use transaction
            const newUserMessageId = crypto.randomUUID();
            const replyMessage: Message = {
                id: newUserMessageId,
                status: "completed",
                generationTime: undefined,
                role: "user",
                content: content,
                timestamp: new Date(),
                modelId: modelId, // requested model
                parentId: id,
                chatId: chatId,
            };
            await db.insert(messages).values(replyMessage);

            // Initialize new response
            // TODO: use transaction
            const newMessageId = crypto.randomUUID();
            const newMessage: Message = {
                id: newMessageId,
                status: "ungenerated",
                generationTime: undefined,
                role: "assistant",
                content: "",
                timestamp: new Date(),
                modelId: modelId,
                parentId: newUserMessageId,
                chatId: chatId,
            };
            await db.insert(messages).values(newMessage);

            return c.json({
                reply: replyMessage,
                new: newMessage,
            });
        },
    )
    .post(
        "/:id/regenerate",
        describeRoute({
            summary: "Regenerate reply to message by ID",
            // description: ,
            // parameters:
            // validateResponse: true,
            responses: {
                200: {
                    description: "New reply message",
                    content: {
                        "application/json": {
                            schema: resolver(
                                regenerateMessageByIdResponseSchema,
                            ),
                        },
                    },
                },
                400: {
                    description: "Bad request",
                    content: {
                        "text/json": {
                            schema: Type.Object({
                                error: Type.String(),
                            }),
                        },
                    },
                },
                401: {
                    description: "Unauthorized",
                }, // TODO(justy): is 404 needed? the reply message endpoint just uses 400
                404: {
                    description: "Message not found",
                },
                // TODO(justy): add internal server error response?
            },
        }),
        validator("json", requestMessageByIdResponseSchema),
        async (c) => {
            // Check if user is authenticated
            // TODO: refactor auth to middleware for all routes
            const user = c.get("user");
            if (!user) {
                return c.json(
                    {
                        error: "Unauthorized",
                    },
                    401,
                );
            }

            const body = c.req.valid("json");
            const { modelId } = body;
            const model = modelIdToLM(modelId);
            if (!model) {
                return c.json(
                    {
                        error: `Model ${modelId} not found`,
                    },
                    400,
                );
            }

            // Find message by ID
            const { id } = c.req.param();
            const db = c.get("db");

            // TODO: Finish handler
            return c.json({}); // TODO
        },
    )
    .get(
        "/:id/stream",
        describeRoute({
            summary: "Stream message by ID",
            // description: ,
            // parameters:
            // validateResponse: true,
            responses: {
                200: {
                    description: "New reply message",
                    content: {
                        "text/plain": {
                            schema: Type.String(),
                        },
                    },
                },
                400: {
                    description: "Bad request",
                    content: {
                        "text/json": {
                            schema: Type.Object({
                                error: Type.String(),
                            }),
                        },
                    },
                },
                401: {
                    description: "Unauthorized",
                },
                404: {
                    description: "Message not found",
                    content: {
                        "text/json": {
                            schema: Type.Object({
                                error: Type.String(),
                            }),
                        },
                    },
                },
                500: {
                    description: "Internal server error",
                    content: {
                        "text/json": {
                            schema: Type.Object({
                                error: Type.String(),
                            }),
                        },
                    },
                },
            },
        }),
        async (c) => {
            // Check if user is authenticated
            // TODO: refactor auth to middleware for all routes
            const user = c.get("user");
            if (!user) {
                return c.json(
                    {
                        error: "Unauthorized",
                    },
                    401,
                );
            }

            // Find message by ID
            const { id: messageId } = c.req.param();

            // Lookup for existing message
            const db = c.get("db");
            const existingMessage = await db.query.messages.findFirst({
                where: (messages, { eq }) => eq(messages.id, messageId),
            });

            if (!existingMessage) {
                return c.json(
                    {
                        error: `Message with ID ${messageId} not found`,
                    },
                    404,
                );
            }

            // Check for early return status
            switch (existingMessage.status) {
                case "completed": {
                    // If the message is already completed, return the content
                    return c.text(existingMessage.content);
                }
                case "error": {
                    return c.json(
                        {
                            error: `Message with ID ${messageId} has an error`,
                        },
                        400,
                    );
                }
                case "in_progress": {
                    // TODO: use cloudflare durable objects
                    return c.json(
                        {
                            error: `Message with ID ${messageId} is already in progress`,
                        },
                        400,
                    );
                }
                case "ungenerated": {
                    const chatId = existingMessage.chatId;
                    const model = modelIdToLM(
                        existingMessage.modelId as ModelId,
                    );
                    if (!model) {
                        return c.json(
                            {
                                error: `Model ${existingMessage.modelId} not found`,
                            },
                            500,
                        );
                    }

                    // Query existing messages
                    // TODO: use transaction
                    const rawMessages = await db.query.messages.findMany({
                        where: (messages, { eq }) =>
                            eq(messages.chatId, chatId),
                    });
                    const messageHistory: CoreMessage[] = rawMessages.map(
                        (msg): CoreMessage => {
                            switch (msg.role) {
                                case "user":
                                    return {
                                        role: "user",
                                        content: msg.content,
                                    } satisfies CoreUserMessage;
                                case "assistant":
                                    return {
                                        role: "assistant",
                                        content: msg.content,
                                    } satisfies CoreAssistantMessage;
                                case "system":
                                    return {
                                        role: "system",
                                        content: msg.content,
                                        // TODO: consider provider options?
                                        providerOptions: undefined,
                                    } satisfies CoreSystemMessage;
                                default:
                                    throw new Error(
                                        `Unknown message role: ${msg.role}`,
                                    );
                            }
                        },
                    );

                    return streamResponse(c, model, messageHistory, messageId);
                }
                case "aborted": {
                    return c.json(
                        {
                            error: `Message with ID ${messageId} was aborted`,
                        },
                        400,
                    );
                }
                default: {
                    return c.json(
                        {
                            error: `Unknown message status ${existingMessage.status} to be implemented`,
                        },
                        500,
                    );
                }
            }
        },
    );

export default app;
