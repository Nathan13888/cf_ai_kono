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
            origin: [
                "http://localhost:1420",
                "http://localhost:3000",
                "https://kono.chat",
            ],
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowHeaders: ["Authorization", "Content-Type"],
            exposeHeaders: ["Content-Length"],
            maxAge: 3600,
            credentials: true,
        }),
    )
    .use(dbMiddleware)
    .use(authMiddleware)
    .route("/auth", auth)
    .route("/chat", chat)
    .route("/message", message)
    .route("/models", models);

export { app };
export type AppType = typeof app;
