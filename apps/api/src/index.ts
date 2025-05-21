import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { createLogger } from "@/logger";
import auth from "@/routes/auth";
import chat from "@/routes/chat";
import { getOpenapi } from "@/routes/openapi";
import { Scalar } from "@scalar/hono-api-reference";
import models from "./routes/models";

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use(createLogger())
  .use(
    cors({
      origin: "*", // TODO: Change in prod
      allowMethods: ["GET", "POST", "PUT", "DELETE"],
      allowHeaders: ["Authorization", "Content-Type"],
      maxAge: 3600,
    })
  )
  .get("/", (c) => {
    const { logger } = c.var;

    const token = c.req.header("Authorization") ?? "";
    logger.debug({ token });

    // const user = getAuthorizedUser(token);
    // logger.assign({ user });

    // const posts = getPosts();
    // logger.assign({ posts });

    logger.setResMessage("Get posts success"); // optional

    return c.text("Hello Hono!");
  }); // TODO: Remove
const routes = app
  .route("/auth", auth)
  .route("/chat", chat)
  .route("/models", models);

const isDevelopment = true; // TODO: Fetch from cloudflare
if (isDevelopment) {
  app.get("/openapi", getOpenapi(app));
  app.get("/scalar", Scalar({ url: "/openapi" }));
  app.use(logger());
}

export default app;
export type AppType = typeof routes;
