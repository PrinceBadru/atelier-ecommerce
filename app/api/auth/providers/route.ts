import { NextResponse } from "next/server";
import { enabledSocialProviders } from "@/lib/auth";
import { authConfig } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const enabledProviders = enabledSocialProviders();

  return NextResponse.json({
    providers: enabledProviders,
    google: enabledProviders.includes("google"),
    github: enabledProviders.includes("github"),
    apple: enabledProviders.includes("apple"),
    microsoft: enabledProviders.includes("microsoft"),
    methods: {
      password: true,
      magicLink: authConfig.magicLink,
      emailOtp: authConfig.emailOtp,
      passkeys: authConfig.passkeys,
      twoFactor: authConfig.twoFactor,
    },
    renderUrl:
      process.env.RENDER_EXTERNAL_URL ||
      process.env.BETTER_AUTH_URL ||
      "https://atelier-web-5swv.onrender.com",
  });
}
