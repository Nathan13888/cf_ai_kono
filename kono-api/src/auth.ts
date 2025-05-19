import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
 
// TODO: Use rate limiting with cloudflare because better auth.
// e.g. could configure with 60second window, 100 requests max.
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
    emailAndPassword: {  
        enabled: true
    },
    // TODO: Add google and maybe github
    // socialProviders: { 
    //     github: { 
    //        clientId: process.env.GITHUB_CLIENT_ID as string, 
    //        clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    //     }, 
    // },
});
