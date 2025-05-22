import { Hono } from "hono";
import auth from "./routes/auth";
import chat from "./routes/chat";
import models from "./routes/models";

const app = new Hono();
const routes = app
  .route("/auth", auth)
  .route("/chat", chat)
  .route("/models", models);

export { app };
export type AppType = typeof routes;
