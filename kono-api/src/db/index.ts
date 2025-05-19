import { drizzle } from 'drizzle-orm/d1';

export interface Env {
    DB: D1Database;
}

// TODO: might break. use zod for runtime validation
const env = process.env as unknown as Env;

export const db = drizzle(env.DB);

// export default {
//   async fetch(request: Request, env: Env) {
//     const db = drizzle(env.DB);
//     const result = await db.select().from(users).all()
//     return Response.json(result);
//   },
// };
