import { auth } from "@/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
    cors({
		origin: "*",
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.on(["POST", "GET"], "**", (c) => {
  return auth.handler(c.req.raw);
});)

export default app;
