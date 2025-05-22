import { auth } from "@/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: CloudflareBindings }>({
  strict: false,
});

app.use(
  "/*",
  cors({
    origin: [
      "http://localhost:1420",
      "https://kono.chat",
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.on(["POST", "GET"], "/*", (c) => {
  console.log("Request:", c.req); // TODO: Remove
  return auth(c.env.DB).handler(c.req.raw);
});

export default app;
