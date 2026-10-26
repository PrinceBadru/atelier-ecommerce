import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  const appleClientId = process.env.APPLE_CLIENT_ID;
  const appleClientSecret = process.env.APPLE_CLIENT_SECRET;
  const microsoftClientId = process.env.MICROSOFT_CLIENT_ID;
  const microsoftClientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  const isGoogleConfigured = Boolean(
    googleClientId &&
    googleClientSecret &&
    googleClientId !== "atelier-google-client-id" &&
    googleClientId !== "unconfigured-google-client-id" &&
    !googleClientId.includes("placeholder")
  );

  const isGithubConfigured = Boolean(
    githubClientId &&
    githubClientSecret &&
    githubClientId !== "atelier-github-client-id" &&
    githubClientId !== "unconfigured-github-client-id" &&
    !githubClientId.includes("placeholder")
  );

  const isAppleConfigured = Boolean(
    appleClientId &&
    appleClientSecret &&
    appleClientId !== "unconfigured-apple-client-id"
  );

  const isMicrosoftConfigured = Boolean(
    microsoftClientId &&
    microsoftClientSecret &&
    microsoftClientId !== "unconfigured-microsoft-client-id"
  );

  return NextResponse.json({
    google: isGoogleConfigured,
    github: isGithubConfigured,
    apple: isAppleConfigured,
    microsoft: isMicrosoftConfigured,
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
