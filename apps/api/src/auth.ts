import { getDb } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";

import * as authSchema from "@/db/auth-schema";

// TODO: Use rate limiting with cloudflare because better auth.
// e.g. could configure with 60second window, 100 requests max.
export const auth = (d: D1Database) =>
  betterAuth({
    database: drizzleAdapter(getDb(d), {
      provider: "sqlite",
      schema: authSchema,
    }),
    trustedOrigins: ['http://localhost:1420', 'https://kono.chat'],
    basePath: "/auth",
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
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
