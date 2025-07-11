import { Hono } from "hono";
import { cors } from "hono/cors";
import { authMiddleware } from "./auth";
import { dbMiddleware } from "./db";
import auth from "./routes/auth";
import chat from "./routes/chat";
import message from "./routes/message";
import models from "./routes/models";

const app = new Hono()
    .use(
        cors({
            origin: [process.env.UI_HOST],
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowHeaders: ["Authorization", "Content-Type"],
            exposeHeaders: ["Content-Length"],
            maxAge: 3600,
            credentials: true,
        }),
    )
    .use(authMiddleware)
    .use(dbMiddleware)
    .route("/auth", auth)
    .route("/chat", chat)
    .route("/message", message)
    .route("/models", models);

export { app };
export type AppType = typeof app;
