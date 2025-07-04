import { getDb } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { openAPI } from "better-auth/plugins"

import * as authSchema from "@/db/auth-schema";
import { createMiddleware } from "hono/factory";
import type { Bindings } from "./bindings";

// TODO: Fetch D1 database from env instead of bindings
// TODO: Use rate limiting with cloudflare because better auth.
// e.g. could configure with 60second window, 100 requests max.
export const auth = (d: D1Database) =>
    betterAuth({
        database: drizzleAdapter(getDb(d), {
            provider: "sqlite",
            schema: authSchema,
        }),
        trustedOrigins: [
            "http://localhost:1420",
            "http://localhost:3000",
            "http://localhost:8787",
            "https://kono.chat",
        ],
        basePath: "/auth",
        socialProviders: {
            // Note: if we ever support other authentication methods (i.e. not just one method), we should implement link social
            google: {
                prompt: "select_account",
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                // redirectUri: "https://localhost:1420/auth/callback/google", // TODO: This
                redirectUri: "https://localhost:3000/auth/callback/google",
            },
        },
        // plugins: [
        //     openAPI(),
        // ]
    });

// export const auth = betterAuth({
//   database: drizzleAdapter(drizzle(process.env.DB as unknown as D1Database), {
//     provider: "sqlite",
//   }),
//   trustedOrigins: ['http://localhost:1420', 'https://kono.chat'],
//   basePath: "/auth",
//   socialProviders: {
//     google: {
//       prompt: "select_account",
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//     },
//   },
// });

// Helper type to extract session return type
type SessionType = Awaited<ReturnType<ReturnType<typeof auth>["api"]["getSession"]>>;
type Session = NonNullable<SessionType>['session'];
type User = NonNullable<SessionType>['user'];
export type AuthType = {
    user: User | null;
    session: Session | null;
};

export const authMiddleware = createMiddleware<{
    Bindings: Bindings;
    Variables: AuthType;
}>(async (c, next) => {
	const session = await auth(c.env.DB).api.getSession({ headers: c.req.raw.headers });
 
  	if (!session) {
    	c.set("user", null);
    	c.set("session", null);
    	return next();
  	}
 
  	c.set("user", session.user);
  	c.set("session", session.session);
  	return next();
});
