import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "shopper",
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "atelier_demo_better_auth_secret_minimum_32_characters_long",
  baseURL: process.env.BETTER_AUTH_URL || process.env.RENDER_EXTERNAL_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
