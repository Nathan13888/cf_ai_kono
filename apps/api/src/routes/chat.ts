import {
    type Chat,
    type ChatMetadata,
    type Message,
    chatSchema,
    messageSchema,
    modelIdSchema,
    newUserMessageSchema,
} from "@kono/models";
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
// import { type CoreUserMessage, streamText } from "ai";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/typebox";
import { v7 as uuidv7 } from "uuid";
import type { AuthType } from "../auth";
import type { Bindings } from "../bindings";
import type { DbBindings } from "../db";
import { chats, messages } from "../db/schema";
import { modelIdToLM } from "../utils/chat";

// const newChatRequestSchema = newUserMessageSchema;
const newChatRequestSchema = Type.Object({});

const sendChatByIdRequestSchema = newUserMessageSchema;

// const chatQuerySchema = Type.Object({
//     modelId: modelIdSchema,
//     // temperature: Type.Optional(Type.Number()),
//     // top_p: Type.Optional(Type.Number()),
//     // max_tokens: Type.Optional(Type.Number()),
//     // stop: Type.Optional(Type.String()),
//     // stream: Type.Optional(Type.Boolean()),
//     // presence_penalty: Type.Optional(Type.Number()),
//     // frequency_penalty: Type.Optional(Type.Number()),
//     // logit_bias: Type.Optional(Type.String()),
//     // user: Type.Optional(Type.String()),
//     // n: Type.Optional(Type.Number()),
// });

const newChatResponseSchema = chatSchema;
const chatResponseSchema = chatSchema;
const sendChatByIdResponseSchema = Type.Object({
    new: messageSchema,
    reply: messageSchema,
});

const app = new Hono<{ Bindings: Bindings; Variables: DbBindings & AuthType }>()
    .post(
        "/",
        describeRoute({
            summary: "Create a new chat",
            // description: ,
            // parameters:
            requestBody: {
                description: "New chat request",
                content: {
                    "application/json": {
                        schema: newChatRequestSchema,
                    },
                },
                required: true,
            },
            validateResponse: true,
            responses: {
                200: {
                    description: "Chat created",
                    content: {
                        "text/plain": {
                            schema: resolver(newChatResponseSchema),
                        },
                    },
                },
                400: {
                    description: "Bad Request",
                    content: {
                        "application/json": {
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
        validator("json", newChatRequestSchema),
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

            const db = c.get("db");

            // Store new message in DB
            const tx = db;
            const [newChat] = await tx
                .insert(chats)
                .values({
                    id: uuidv7(),
                    title: undefined,
                    creatorId: user.id,
                    createdAt: new Date(),
                    lastUpdatedAt: new Date(),
                })
                .returning();
            if (!newChat) {
                throw new Error("Failed to create new chat for some reason");
            }

            // Re-query to get the complete chat and its messages separately
            const chatData = await db.query.chats.findFirst({
                where: (chats, { eq }) => eq(chats.id, newChat.id),
            });

            if (!chatData) {
                throw new Error("Failed to fetch created chat");
            }

            const chatMessages = await db.query.messages.findMany({
                where: (messages, { eq }) => eq(messages.chatId, newChat.id),
            });

            const chat: Chat = {
                id: chatData.id,
                title: chatData.title ?? undefined,
                creatorId: chatData.creatorId,
                createdAt: chatData.createdAt,
                lastUpdatedAt: chatData.lastUpdatedAt,

                // TODO(justy): how likely would new chats have more than the initial message?
                messages: chatMessages.map(
                    (msg): Message => ({
                        id: msg.id,
                        status: msg.status,
                        generationTime: msg.generationTime,
                        role: msg.role,
                        content: msg.content,
                        timestamp: msg.timestamp,
                        modelId: Value.Parse(modelIdSchema, msg.modelId),
                        parentId: msg.parentId ?? undefined,
                        chatId: msg.chatId,
                    }),
                ),
            };

            return c.json(chat);
        },
    )
    .get(
        "/:id",
        describeRoute({
            summary: "Fetch chat by ID",
            // description: ,
            // parameters:
            validateResponse: true,
            responses: {
                200: {
                    description: "Chat metadata fetched",
                    content: {
                        "text/plain": {
                            schema: resolver(chatResponseSchema),
                        },
                    },
                },
                401: {
                    description: "Unauthorized",
                },
                403: {
                    description: "Forbidden",
                },
                404: {
                    description: "Chat not found",
                    content: {
                        "application/json": {
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
            const { id: chatId } = c.req.param();

            const db = c.get("db");

            const metadata: ChatMetadata | undefined =
                chatId.length > 0
                    ? await db.query.chats
                          .findFirst({
                              where: (chats, { eq }) => eq(chats.id, chatId),
                          })
                          .then((r) =>
                              r
                                  ? {
                                        id: r.id,
                                        title: r.title ?? undefined,
                                        creatorId: r.creatorId,
                                        createdAt: r.createdAt,
                                        lastUpdatedAt: r.lastUpdatedAt,
                                    }
                                  : undefined,
                          )
                    : undefined;
            if (!metadata) {
                return c.json(
                    {
                        error: "Chat not found",
                    },
                    404,
                );
            }

            const messages: Message[] = await db.query.messages
                .findMany({
                    where: (messages, { eq }) => eq(messages.chatId, chatId),
                })
                .then((msgs) =>
                    msgs.map(
                        (msg): Message => ({
                            id: msg.id,
                            status: msg.status,
                            generationTime: msg.generationTime,
                            role: msg.role,
                            content: msg.content,
                            timestamp: msg.timestamp,
                            modelId: Value.Parse(modelIdSchema, msg.modelId),
                            parentId: msg.parentId ?? undefined,
                            chatId: msg.chatId,
                        }),
                    ),
                );
            const chat: Chat = {
                ...metadata,
                messages: messages,
            };

            return c.json(chat);
        },
    )
    .post(
        "/:id",
        describeRoute({
            summary: "Send message to chat",
            // description: ,
            // parameters:
            // validateResponse: true,
            responses: {
                200: {
                    description: "Successful response",
                    content: {
                        // TODO(justy): stream response doesn't seem to be this?
                        "application/json": {
                            schema: resolver(sendChatByIdResponseSchema),
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
        validator("json", sendChatByIdRequestSchema),
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

            const { id: chatId } = c.req.param();
            const db = c.get("db");

            // Check if the message is already being processed
            // TODO: impl
            // TODO: use transaction to ensure atomicity

            // Check if chat exists
            const chat = await db.query.chats.findFirst({
                where: (chats, { eq }) => eq(chats.id, chatId),
            });
            if (!chat) {
                return c.json(
                    {
                        error: `Chat with ID ${chatId} not found`,
                    },
                    404,
                );
            }

            if (chat.creatorId !== user.id) {
                return c.json(
                    {
                        error: `Chat with ID ${chatId} does not belong to user ${user.id}`,
                    },
                    403,
                );
            }

            // Get newest user message in chat
            const userMessages = await db.query.messages.findMany({
                where: (messages, { eq }) =>
                    eq(messages.chatId, chatId) &&
                    eq(messages.role, "assistant"),
                orderBy: (messages) => messages.timestamp,
                limit: 1,
            });

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
                parentId: userMessages[0]?.id, // link to the last chat message
                chatId: chatId,
            };
            await db.insert(messages).values(newMessage);

            // Initialize new user message in history and db
            // TODO: use transaction
            const replyMessageId = crypto.randomUUID();
            const replyMessage: Message = {
                id: replyMessageId,
                status: "completed",
                generationTime: undefined,
                role: "user",
                content: content,
                timestamp: new Date(),
                modelId: modelId, // requested model
                parentId: newMessageId,
                chatId: chatId,
            };
            await db.insert(messages).values(replyMessage);

            return c.json({
                new: newMessage,
                reply: replyMessage,
            });
        },
    );

export default app;
