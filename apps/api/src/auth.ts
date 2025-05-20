import { getDb } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

// TODO: Use rate limiting with cloudflare because better auth.
// e.g. could configure with 60second window, 100 requests max.
export const auth = (env: Cloudflare.Env) =>
  betterAuth({
    database: drizzleAdapter(getDb(env.DB), {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
    // TODO: Add google and maybe github
    // socialProviders: {
    //     github: {
    //        clientId: process.env.GITHUB_CLIENT_ID as string,
    //        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //     },
    // },
  });
