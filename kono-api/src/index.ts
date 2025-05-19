import { Hono } from "hono";
import { pinoLogger } from "hono-pino";

import auth from "@/routes/auth";
import chat from "@/routes/chat";
import { getOpenapi } from "@/routes/openapi";
import { Scalar } from "@scalar/hono-api-reference";

const createLogger = () =>
  pinoLogger({
    pino: {
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      }, // TODO: Use JSON logging for prod
    },
  });

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .use(createLogger())
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
  });

app.route("/auth", auth);
app.route("/chat", chat);

const isDevelopment = true; // TODO: Fetch from cloudflare
if (isDevelopment) {
  app.get("/openapi", getOpenapi(app));
  app.get("/scalar", Scalar({ url: "/openapi" }));
}

export default app;
