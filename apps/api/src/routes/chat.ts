import { google } from '@ai-sdk/google';
import { type ModelId, modelIdSchema } from "@kono/models";
import { Type } from "@sinclair/typebox";
import { type LanguageModel, streamText } from "ai";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/typebox";
import { streamText as stream } from "hono/streaming";
import { ollama } from "ollama-ai-provider";

function modelIdToLM(modelId: ModelId): LanguageModel {
  switch (modelId) {
    case "qwen3:1.7b":
      return ollama("qwen3:1.7b"); // TODO: Make the API key to a URL by env variable to support remote servers
    case "gemini-2.0-flash":
      return google("gemini-2.0-flash");
    case "gemini-2.5-flash-preview-05-20":
      return google("gemini-2.5-flash-preview-05-20");
    case "gemini-2.5-pro-preview-05-06":
      return google("gemini-2.5-pro-preview-05-06");
    default:
      let _exhaustiveCheck: never;
      throw new Error("Unknown model ID");
  }
}

const chatRequestSchema = Type.Object({
  messages: Type.Array(
    Type.Object({
      role: Type.Union([
        Type.Literal("user"),
        Type.Literal("assistant"),
        Type.Literal("system"),
      ]),
      content: Type.String(),
    })
  ), // TODO: Make this a bigger subset to match AI SDK capabilities
});

const chatQuerySchema = Type.Object({
  modelId: modelIdSchema, // TODO: Add more models later
  // temperature: Type.Optional(Type.Number()),
  // top_p: Type.Optional(Type.Number()),
  // max_tokens: Type.Optional(Type.Number()),
  // stop: Type.Optional(Type.String()),
  // stream: Type.Optional(Type.Boolean()),
  // presence_penalty: Type.Optional(Type.Number()),
  // frequency_penalty: Type.Optional(Type.Number()),
  // logit_bias: Type.Optional(Type.String()),
  // user: Type.Optional(Type.String()),
  // n: Type.Optional(Type.Number()),
});
// .openapi({
//   ref: "Query",
//   description: "Query parameters for the chat endpoint",
//   example: {
//     model: "qwen3:1.7b",
//   },
// });

const chatResponseSchema = Type.String();

const app = new Hono().post(
  "/",
  describeRoute({
    summary: "Chat test",
    description: "Chat test",
    // parameters:
    requestBody: {
      description: "LLM messages",
      content: {
        "application/json": {
          schema: chatRequestSchema,
        },
      },
      required: true,
    },
    // validateResponse: true,
    responses: {
      200: {
        description: "LLM Output",
        content: {
          "text/plain": {
            schema: resolver(chatResponseSchema),
          },
        },
      },
    },
  }),
  validator("query", chatQuerySchema),
  validator("json", chatRequestSchema),
  async (c) => {
    const query = c.req.valid("query");
    const body = c.req.valid("json");
    console.log("query", query); // TODO
    console.log("body", body); // TODO
    const model = modelIdToLM(query.modelId);

    const result = await streamText({
      model: model,
      // system: "", // TODO: Make system prompt configurable
      messages: body.messages,
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
      }
    );
    // TODO: Clean up properly if either client or model API drops

    // return streamSSE(c, async (stream) => {
    //   while (true) {
    //     const message = `It is ${new Date().toISOString()}`;
    //     await stream.writeSSE({
    //       data: message,
    //       event: "time-update",
    //       id: String(id++),
    //     });
    //     await stream.sleep(1000);
    //   }
    // });
  }
);

export default app;
