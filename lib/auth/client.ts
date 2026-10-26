import { createAuthClient } from "better-auth/react";
import {
  magicLinkClient,
  emailOTPClient,
  twoFactorClient,
  adminClient,
} from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    adminClient(),
    magicLinkClient(),
    emailOTPClient(),
    passkeyClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        const next =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("next")
            : null;
        if (typeof window !== "undefined") {
          window.location.href = `/two-factor${next ? `?next=${encodeURIComponent(next)}` : ""}`;
        }
      },
    }),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  linkSocial,
  revokeSession,
  revokeOtherSessions,
} = authClient;
