import {
    type Chat,
    type ChatMetadata,
    type Message,
    chatMetadataSchema,
    chatSchema,
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

const newChatRequestSchema = newUserMessageSchema;

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
const chatResponseSchema = chatMetadataSchema;

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
            // validateResponse: true,
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

            const body = c.req.valid("json");
            const { content, modelId } = body;

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

            // Insert the initial user message
            tx.insert(messages).values({
                id: uuidv7(),
                status: "completed",
                generationTime: undefined,
                role: "user",
                content: content,
                timestamp: new Date(),
                modelId: modelId,
                parentId: null,
                chatId: newChat.id,
            });

            await tx.insert(messages).values({
                id: uuidv7(),
                status: "ungenerated",
                generationTime: undefined,
                role: "user",
                content: content,
                timestamp: new Date(),
                modelId: modelId,
                parentId: null,
                chatId: newChat.id,
            });

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
            summary: "Fetch chat metadata by ID",
            // description: ,
            // parameters:
            // validateResponse: true,
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

            const chat: ChatMetadata | undefined =
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
            if (!chat) {
                return c.json(
                    {
                        error: "Chat not found",
                    },
                    404,
                );
            }

            // const messages: Message[] = await db
            //     .query.messages.findMany({
            //         where: (messages, { eq }) => eq(messages.chatId, chatId),
            //     }).then((msgs) => msgs.map(
            //         (msg): Message => ({
            //             id: msg.id,
            //             status: msg.status,
            //             generationTime: msg.generationTime,
            //             role: msg.role,
            //             content: msg.content,
            //             timestamp: msg.timestamp,
            //             modelId: Value.Parse(modelIdSchema, msg.modelId),
            //             parentId: msg.parentId ?? undefined,
            //             chatId: msg.chatId,
            //         })
            //     ));
            // const response: Chat = {
            //     ...chat,
            //     messages: messages
            // };

            return c.json(chat);
        },
    );

export default app;
