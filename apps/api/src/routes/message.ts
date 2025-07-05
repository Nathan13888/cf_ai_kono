import type { AuthType } from "@/auth";
import type { Bindings } from "@/bindings";
import type { DbBindings } from "@/db";
import { modelIdToLM } from "@/utils/chat";
import {
    messageSchema,
    modelIdSchema,
    newUserMessageSchema,
} from "@kono/models";
import { Type } from "@sinclair/typebox";
import { type CoreMessage, streamText } from "ai";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/typebox";
import { streamText as stream } from "hono/streaming";

const sendMessageByIdRequestSchema = newUserMessageSchema;
const sendMessageByIdResponseSchema = Type.Object({
    new: messageSchema,
    reply: messageSchema,
});
const requestMessageByIdResponseSchema = Type.Object({
    modelId: modelIdSchema,
});
const regenerateMessageByIdResponseSchema = messageSchema;

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

            // Find message by ID
            const { id } = c.req.param();
            const db = c.get("db");

            const messages: CoreMessage[] = []; // TODO: Get messages from DB

            const result = await streamText({
                model: model,
                // system: "", // TODO: Make system prompt configurable
                messages: messages,
            });
            const { textStream } = result; // TODO: Use other bits of the stream result for things like counting usage.

            c.header("Content-Encoding", "Identity");
            return stream(
                c,
                async (stream) => {
                    const message = []; // TODO: push it out occasionally to DB and ensure it ends with another update
                    for await (const textPart of textStream) {
                        message.push(textPart);
                        // console.log("message:", message);
                        await stream.write(textPart);
                    }
                    // /// Write a text with a new line ('\n').
                    // await stream.writeln("Hello");
                    // // Wait 1 second.
                    // await stream.sleep(5000);
                    // // Write a text without a new line.
                    // await stream.write(`Hosdfno.`);
                },
                async (err, stream) => {
                    stream.writeln("An error occurred!");
                    console.error(err);
                },
            );

            // TODO: Finish handler
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
                },
                404: {
                    description: "Message not found",
                },
            },
        }),
        validator("json", requestMessageByIdResponseSchema),
        async (c) => {
            // Check if user is authenticated
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
                // 400: {
                //     description: "Bad request",
                //     content: {
                //         "text/json": {
                //             schema: Type.Object({
                //                 error: Type.String(),
                //             }),
                //         },
                //     },
                // },
                401: {
                    description: "Unauthorized",
                },
                404: {
                    description: "Message not found",
                },
            },
        }),
        async (c) => {
            // Check if user is authenticated
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
            const { id } = c.req.param();
            const db = c.get("db");

            // TODO: Finish handler
        },
    );

export default app;

// TODO: Use all these
