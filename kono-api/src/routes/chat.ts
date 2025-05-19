import { streamText } from "ai";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { streamText as stream } from "hono/streaming";
import { ollama } from "ollama-ai-provider";

const app = new Hono();
// TODO
app.get(
  "/",
  describeRoute({
    summary: "Chat test",
    validateResponse: true,
  }),
  async (c) => {
    const model = ollama("qwen3:1.7b");
    const result = await streamText({
      model: model,
      prompt: "How are you?",
    });
    const { textStream } = result; // TODO: Use other bits of the stream result for things like counting usage.

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

    c.header("Content-Encoding", "Identity");
    return stream(c, async (stream) => {
      const messages = []; // TODO: push it out occasionally to DB and ensure it ends with another update
      for await (const textPart of textStream) {
        messages.push(textPart);
        await stream.write(textPart);
      }
      // /// Write a text with a new line ('\n').
      // await stream.writeln("Hello");
      // // Wait 1 second.
      // await stream.sleep(5000);
      // // Write a text without a new line.
      // await stream.write(`Hosdfno.`);
    });

    // return c.text(`LLM Output: ${JSON.stringify(messages)}`);
  }
);

export default app;
