import {
    type ModelId,
    regenerateMessageByIdResponseSchema,
    requestMessageByIdResponseSchema,
} from "@kono/models";
import { Type } from "@sinclair/typebox";
import type {
    CoreAssistantMessage,
    CoreMessage,
    CoreSystemMessage,
    CoreUserMessage,
    ImagePart,
    LanguageModelV1,
    TextPart,
} from "ai";
import { type Context, Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/typebox";
import type { AuthType } from "../auth";
import type { Bindings } from "../bindings";
import type { DbBindings } from "../db";
import type { ChatDurableObject } from "../objects/streaming";
import { modelIdToLM } from "../utils/chat";

// Utility function to check and recover from partial streams
const checkStreamRecovery = async (
    streamingNamespace: DurableObjectNamespace<ChatDurableObject>,
    messageId: string,
): Promise<{ needsRecovery: boolean; partialContent?: string }> => {
    try {
        const durableObjectId = streamingNamespace.idFromName(messageId);
        const durableObjectStub = streamingNamespace.get(durableObjectId);

        const recoveryRequest = new Request("https://do/recover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messageId }),
        });

        const response = await durableObjectStub.fetch(recoveryRequest);
        if (response.ok) {
            const recoveryData = (await response.json()) as {
                status: string;
                content: string;
                recovered: boolean;
            };

            return {
                needsRecovery:
                    recoveryData.recovered &&
                    recoveryData.status !== "completed",
                partialContent: recoveryData.content,
            };
        }
    } catch (error) {
        console.warn(`Recovery check failed for ${messageId}:`, error);
    }

    return { needsRecovery: false };
};

const streamResponse = async (
    c: Context,
    model: LanguageModelV1,
    messageHistory: CoreMessage[],
    newMessageId: string,
    chatId: string,
    userId: string,
) => {
    const streamingNamespace = c.env.CHAT_DURABLE_OBJECT;

    console.log(
        `Streaming response for message ${newMessageId} with model ${model.modelId.toString()}`,
    );

    try {
        // Get or create durable object stub for this message
        // Using the message ID ensures the same Durable Object handles recovery/reconnection
        const durableObjectId = streamingNamespace.idFromName(newMessageId);
        const durableObjectStub = streamingNamespace.get(durableObjectId);

        // Start streaming via durable object
        const streamRequest = new Request("https://do/start", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "text/plain",
            },
            body: JSON.stringify({
                messageId: newMessageId,
                chatId,
                userId,
                model: {
                    modelId: model.modelId,
                    provider: model.provider,
                },
                messageHistory,
            }),
        });

        // Proxy the streaming response from the durable object
        const response = await durableObjectStub.fetch(streamRequest);

        if (!response.ok) {
            const errorText = await response
                .text()
                .catch(() => "Unknown error");
            throw new Error(
                `Durable object streaming failed (${response.status}): ${errorText}`,
            );
        }

        // Return the streamed response with proper headers
        return new Response(response.body, {
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Content-Encoding": "Identity",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error(
            `Stream setup failed for message ${newMessageId}:`,
            error,
        );
        throw error;
    }
};

const app = new Hono<{ Bindings: Bindings; Variables: DbBindings & AuthType }>()
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
                    // Check if we can recover or continue streaming from Durable Object
                    const streamingNamespace = c.env.CHAT_DURABLE_OBJECT;
                    const recovery = await checkStreamRecovery(
                        streamingNamespace,
                        messageId,
                    );

                    if (recovery.needsRecovery) {
                        // Continue streaming from where we left off
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

                        // Get message history (simplified for recovery)
                        const rawMessages = await db.query.messages.findMany({
                            where: (messages, { eq }) =>
                                eq(messages.chatId, existingMessage.chatId),
                        });

                        const messageHistory: CoreMessage[] = rawMessages
                            .filter((msg) => msg.status === "completed")
                            .map((msg) => {
                                switch (msg.role) {
                                    case "user":
                                        return {
                                            role: "user",
                                            content: msg.content,
                                        } as CoreMessage;
                                    case "assistant":
                                        return {
                                            role: "assistant",
                                            content: msg.content,
                                        } as CoreMessage;
                                    case "system":
                                        return {
                                            role: "system",
                                            content: msg.content,
                                        } as CoreMessage;
                                    default:
                                        throw new Error(
                                            `Unknown message role: ${msg.role}`,
                                        );
                                }
                            });

                        return streamResponse(
                            c,
                            model,
                            messageHistory,
                            messageId,
                            existingMessage.chatId,
                            user.id,
                        );
                    }

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

                    const messageHistory: CoreMessage[] = [];
                    const mapMessageToCoreMessage = (
                        msg: (typeof rawMessages)[number],
                    ): CoreMessage => {
                        switch (msg.role) {
                            case "user":
                                return {
                                    role: "user",
                                    content:
                                        (msg.attachments ?? []).length > 0
                                            ? [
                                                  {
                                                      type: "text",
                                                      text: msg.content,
                                                  } as TextPart,
                                                  ...(msg.attachments?.map(
                                                      (a) =>
                                                          ({
                                                              type: "image",
                                                              image: a,
                                                              mimeType:
                                                                  "image/png",
                                                              // TODO: infer MIME type from attachment
                                                          }) as ImagePart,
                                                      // TODO: support other types of attachments
                                                  ) ?? []),
                                              ]
                                            : msg.content,
                                } satisfies CoreUserMessage;
                            // TODO: support other types of outputs
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
                    };
                    for (const msg of rawMessages) {
                        if (msg.status !== "completed") continue;

                        messageHistory.push(mapMessageToCoreMessage(msg));
                    }

                    return streamResponse(
                        c,
                        model,
                        messageHistory,
                        messageId,
                        chatId,
                        user.id,
                    );
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
