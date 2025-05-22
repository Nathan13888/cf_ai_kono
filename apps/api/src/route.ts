import { Hono } from "hono";
import { cors } from "hono/cors";
import auth from "./routes/auth";
import chat from "./routes/chat";
import models from "./routes/models";

const app = new Hono()
    .use(
        cors({
            origin: ["http://localhost:1420", "https://kono.chat"],
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowHeaders: ["Authorization", "Content-Type"],
            exposeHeaders: ["Content-Length"],
            maxAge: 3600,
            credentials: true,
        }),
    )
    .route("/auth", auth)
    .route("/chat", chat)
    .route("/models", models);

export { app };
export type AppType = typeof app;
