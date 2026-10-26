import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

function getBaseUrl(): string {
  let raw =
    process.env.BETTER_AUTH_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    raw = raw.includes(".") ? `https://${raw}` : `https://${raw}.onrender.com`;
  }
  return raw;
}

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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "atelier-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "atelier-google-client-secret",
      enabled: true,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "atelier-github-client-id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "atelier-github-client-secret",
      enabled: true,
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        // Output magic link to server logs for development and test workflows
        console.log(`[Better-Auth Magic Link] Destination: ${email} -> ${url}`);
      },
    }),
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "shopper",
      },
    },
  },
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "atelier_demo_better_auth_secret_minimum_32_characters_long",
  baseURL: getBaseUrl(),
});

export type Session = typeof auth.$Infer.Session;
