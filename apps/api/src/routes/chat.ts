import {
    type Chat,
    type ChatMetadata,
    type Message,
    TITLE_GENERATION_MODEL_ID,
    chatMetadataSchema,
    chatSchema,
    modelIdSchema,
    sendChatByIdRequestSchema,
    sendChatByIdResponseSchema,
} from "@kono/models";
import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { generateText } from "ai";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/typebox";
import type { AuthType } from "../auth";
import type { Bindings } from "../bindings";
import type { DbBindings } from "../db";
import { chats, messages } from "../db/schema";
import { modelIdToLM } from "../utils/chat";

const DEFAULT_CHAT_HISTORY_COUNT = 20;

const chatResponseSchema = chatSchema;

const app = new Hono<{ Bindings: Bindings; Variables: DbBindings & AuthType }>()
    .get(
        "/",
        describeRoute({
            summary: "Fetch chat history",
            validateResponse: true,
            responses: {
                200: {
                    description: "Chat history fetched",
                    content: {
                        "text/plain": {
                            schema: resolver(Type.Array(chatMetadataSchema)),
                        },
                    },
                },
                401: {
                    description: "Unauthorized",
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

            // Get optional query
            // TODO:
            const limitQuery = c.req.query("limit");
            let limit = DEFAULT_CHAT_HISTORY_COUNT;
            if (limitQuery) {
                try {
                    limit = Number.parseInt(limitQuery, 10);
                } catch (e) {
                    return c.json(
                        {
                            error: "Invalid limit parameter. Must be a number.",
                        },
                        400,
                    );
                }
            }

            if (limit <= 0 || limit > 100) {
                return c.json(
                    {
                        error: "Invalid count parameter. Must be between 1 and 100.",
                    },
                    400,
                );
            }

            // Fetch all chats for the user
            const db = c.get("db");
            const chatHistory: ChatMetadata[] = (
                await db.query.chats.findMany({
                    where: (chats, { eq }) => eq(chats.creatorId, user.id),
                    orderBy: (chats, { desc }) => desc(chats.lastUpdatedAt),
                    limit,
                })
            ).map((chat) => ({
                id: chat.id,
                title: chat.title ?? undefined,
                creatorId: chat.creatorId,
                createdAt: !Number.isNaN(chat.createdAt.getTime())
                    ? chat.createdAt.toISOString()
                    : new Date().toISOString(),
                lastUpdatedAt: !Number.isNaN(chat.lastUpdatedAt.getTime())
                    ? chat.lastUpdatedAt.toISOString()
                    : new Date().toISOString(),
            }));

            return c.json(chatHistory);
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
                                        createdAt: !Number.isNaN(
                                            r.createdAt.getTime(),
                                        )
                                            ? r.createdAt.toISOString()
                                            : new Date().toISOString(),
                                        lastUpdatedAt: !Number.isNaN(
                                            r.lastUpdatedAt.getTime(),
                                        )
                                            ? r.lastUpdatedAt.toISOString()
                                            : new Date().toISOString(),
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
                            timestamp:
                                msg.timestamp &&
                                !Number.isNaN(msg.timestamp.getTime())
                                    ? msg.timestamp.toISOString()
                                    : null,
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
            const { content, attachments, modelId } = body;

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

            // Check if attachments are required and model supports them
            // if (
            //     attachments &&
            //     MODELS[modelId].capabilities?.includes("multimodal")
            // ) {
            //     return c.json(
            //         {
            //             error: `Model ${modelId} does not support attachments`,
            //         },
            //         400,
            //     );
            // }
            // TODO: scan each attachment for problems or other restrictions

            const { id: chatId } = c.req.param();
            const db = c.get("db");

            // Check if the message is already being processed
            // TODO: impl
            // TODO: use transaction to ensure atomicity

            // Check if chat exists
            let chat = await db.query.chats.findFirst({
                where: (chats, { eq }) => eq(chats.id, chatId),
            });
            if (!chat) {
                // generate title based on message
                const title_model = modelIdToLM(TITLE_GENERATION_MODEL_ID);
                if (!title_model) {
                    return c.json(
                        {
                            error: `Model ${TITLE_GENERATION_MODEL_ID} not found`,
                        },
                        500,
                    );
                }
                const { text: title } = await generateText({
                    model: title_model,
                    system: "Concise title generator",
                    prompt: `Generate a short title for this conversation based on this initial request: "${content}"`,
                });
                console.debug(
                    `Generated chat title for prompt ${content}: '${title}'`,
                );

                // TODO: improve validation
                const [newChat] = await db
                    .insert(chats)
                    .values({
                        id: chatId,
                        title,
                        creatorId: user.id,
                        createdAt: new Date(),
                        lastUpdatedAt: new Date(),
                    })
                    .returning();
                if (!newChat) {
                    return c.json(
                        {
                            error: `Chat with ID ${chatId} could not be created.`,
                        },
                        500,
                    );
                }
                chat = newChat;
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
            const newMessageData = {
                id: newMessageId,
                status: "completed" as const,
                generationTime: undefined,
                role: "user" as const,
                content: content,
                attachments: attachments,
                timestamp: new Date(),
                modelId: modelId,
                parentId: userMessages[0]?.id, // link to the last chat message
                chatId: chatId,
            };
            await db.insert(messages).values(newMessageData);

            // Initialize new user message in history and db
            // TODO: use transaction
            const replyMessageId = crypto.randomUUID();
            const replyMessageData = {
                id: replyMessageId,
                status: "ungenerated" as const,
                generationTime: undefined,
                role: "assistant" as const,
                content: "",
                timestamp: new Date(),
                modelId: modelId, // requested model
                parentId: newMessageId,
                chatId: chatId,
            };
            await db.insert(messages).values(replyMessageData);

            // Create API response objects with string timestamps
            const newMessage: Message = {
                ...newMessageData,
                timestamp: newMessageData.timestamp.toISOString(),
            };
            const replyMessage: Message = {
                ...replyMessageData,
                timestamp: replyMessageData.timestamp.toISOString(),
            };

            return c.json({
                new: newMessage,
                reply: replyMessage,
            });
        },
    );

export default app;
