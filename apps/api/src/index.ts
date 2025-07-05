import { logger } from "hono/logger";

import { app as route_app } from "@/route";
import { getOpenapi } from "@/routes/openapi";
import { Scalar } from "@scalar/hono-api-reference";

const app = route_app;

const isDevelopment = true; // TODO: Fetch from cloudflare
if (isDevelopment) {
    app.get("/test", async (c) => {
        //     const { logger } = c.var;

        //     const token = c.req.header("Authorization") ?? "";
        //     logger.debug({ token });

        //     // const user = getAuthorizedUser(token);
        //     // logger.assign({ user });

        //     // const posts = getPosts();
        //     // logger.assign({ posts });

        //     logger.setResMessage("Get posts success"); // optional

        // TODO: Remove this
        const id: DurableObjectId = c.env.CHAT_DURABLE_OBJECT.idFromName(
            "chat-durable-object",
        ); // TODO: Is this name correct?
        const stub = c.env.CHAT_DURABLE_OBJECT.get(id);
        // TODO: Note, we want to avoid round trips with Durable Object by having the methods in DurableObject implementations do all the queries together

        const users = await stub.insertAndList({
            id: crypto.randomUUID(), // Generate a random UUID for the user ID
            name: "John",
            email: "john@example.com",
        });
        console.log(
            "New user created. Getting all users from the database: ",
            users,
        );

        return c.json(users);
    });

    app.get("/openapi", getOpenapi(app));
    app.get("/scalar", Scalar({ url: "/openapi" }));
    app.use(logger());
}

export * from "./objects";
export default app;
