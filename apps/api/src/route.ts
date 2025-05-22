import { Hono } from "hono";
import auth from "./routes/auth";
import chat from "./routes/chat";
import models from "./routes/models";

export const app = new Hono<{ Bindings: CloudflareBindings }>();
const routes = app
  .route("/auth", auth)
  .route("/chat", chat)
  .route("/models", models);

export type AppType = typeof routes;
