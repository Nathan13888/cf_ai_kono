import { type DrizzleD1Database, drizzle } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";
import * as schema from "./schema";
import type { Bindings } from "@/bindings";

export interface DbBindings {
    db: DrizzleD1Database<typeof schema> & {
        $client: D1Database;
    };
}

export const getDb = (d: D1Database) => {
    return drizzle(d, { schema });
};

export const dbMiddleware = createMiddleware<{
    Bindings: Bindings;
    Variables: DbBindings;
}>(async (c, next) => {
    const db = await getDb(c.env.DB);
    c.set("db", db);
    await next();
});

// export default {
//   async fetch(request: Request, env: Env) {
//     const db = drizzle(env.DB);
//     const result = await db.select().from(users).all()
//     return Response.json(result);
//   },
// };
