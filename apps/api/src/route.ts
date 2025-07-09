import { Hono } from "hono";
import auth from "./routes/auth";
import chat from "./routes/chat";
import message from "./routes/message";
import models from "./routes/models";

const app = new Hono()
    .route("/auth", auth)
    .route("/chat", chat)
    .route("/message", message)
    .route("/models", models);

export { app };
export type AppType = typeof app;
