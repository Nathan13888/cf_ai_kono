import { Hono } from "hono";
import { describeRoute } from "hono-openapi";

const app = new Hono();
// TODO
app.get(
  "/",
  describeRoute({
    summary: "LfOL",
    validateResponse: true,
  }),
  (c) => c.text("Validated Response")
);

export default app;
