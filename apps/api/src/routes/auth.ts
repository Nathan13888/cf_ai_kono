import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "../auth";
import type { Bindings } from "../bindings";

const app = new Hono<{ Bindings: Bindings }>({
    strict: false,
});

app.use(
    "/*",
    cors({
        origin: [process.env.UI_HOST],
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "GET", "OPTIONS"],
        exposeHeaders: ["Content-Length"],
        maxAge: 600,
        credentials: true,
    }),
);

app.on(["POST", "GET"], "/*", (c) => {
    console.log("Request:", c.req); // TODO: Remove

    return auth(c.env.DB).handler(c.req.raw);
});

export default app;
