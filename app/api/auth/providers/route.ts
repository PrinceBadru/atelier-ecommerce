import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

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

  return NextResponse.json({
    google: isGoogleConfigured,
    github: isGithubConfigured,
    renderUrl:
      process.env.RENDER_EXTERNAL_URL ||
      process.env.BETTER_AUTH_URL ||
      "https://atelier-web-5swv.onrender.com",
  });
}
