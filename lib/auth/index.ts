import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, magicLink, emailOTP, twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { authConfig } from "./config";

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

function credentials(prefix: string) {
  const clientId = process.env[`${prefix}_CLIENT_ID`];
  const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];
  if (!clientId || !clientSecret) return undefined;
  if (
    clientId.includes("unconfigured") ||
    clientId.includes("placeholder") ||
    clientId === "atelier-google-client-id" ||
    clientId === "atelier-github-client-id"
  ) {
    return undefined;
  }
  return { clientId, clientSecret };
}

const providerSettings: Record<string, { clientId: string; clientSecret: string } | undefined> = {
  google: credentials("GOOGLE"),
  github: credentials("GITHUB"),
  apple: credentials("APPLE"),
  microsoft: credentials("MICROSOFT"),
};

export const socialProviders = Object.fromEntries(
  authConfig.social.flatMap((provider) =>
    providerSettings[provider] ? [[provider, providerSettings[provider]!]] : []
  )
) as Record<string, { clientId: string; clientSecret: string }>;

export function enabledSocialProviders() {
  return Object.keys(socialProviders);
}

export const auth = betterAuth({
  appName: "Atelier",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
      passkey: schema.passkeys,
      twoFactor: schema.twoFactors,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: authConfig.requireEmailVerification,
  },
  socialProviders,
  plugins: [
    admin({
      defaultRole: "shopper",
      adminRoles: ["admin"],
    }),
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        // Output magic link to server logs for verification & test automation
        console.log(`[Better-Auth Magic Link] Destination: ${email} -> ${url}`);
      },
      expiresIn: 5 * 60,
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Output OTP to server logs for development, verification, and tests
        console.log(`[Better-Auth Email OTP] (${type}) for ${email}: ${otp}`);
      },
      otpLength: 6,
      expiresIn: 5 * 60,
      allowedAttempts: 5,
    }),
    twoFactor({
      issuer: "Atelier",
      otpOptions: {
        async sendOTP({ user, otp }) {
          console.log(`[Better-Auth 2FA OTP] for ${user.email}: ${otp}`);
        },
        allowedAttempts: 5,
      },
      allowPasswordless: true,
    }),
    passkey({
      rpName: "Atelier",
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
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://atelier-web-5swv.onrender.com",
    process.env.BETTER_AUTH_URL || "",
    process.env.NEXT_PUBLIC_APP_URL || "",
  ].filter(Boolean),
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});

export type Session = typeof auth.$Infer.Session;
