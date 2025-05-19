import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";

interface DbBindings {
  db: DrizzleD1Database<Record<string, never>> & {
    $client: D1Database;
  };
}

// export const db = await drizzle(c.env.DB);

export const getDb = (d: D1Database) => {
  return drizzle(d);
};

export const dbMiddleware = createMiddleware<{
  Bindings: CloudflareBindings;
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
