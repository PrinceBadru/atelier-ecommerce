"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import type { SocialProvider } from "@/lib/auth/config";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { authErrorMessage } from "@/lib/auth/error-message";

export const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: "Google",
  github: "GitHub",
  apple: "Apple",
  microsoft: "Microsoft",
};

interface Props {
  providers?: SocialProvider[];
  variant?: "full" | "icon";
  next: string;
  onError: (message: string) => void;
}

export function SocialButtons({
  providers = [],
  variant = "full",
  next,
  onError,
}: Props) {
  const [pending, setPending] = useState<SocialProvider | null>(null);

  // Flare Framework: unconfigured providers never render a button
  if (!providers || providers.length === 0) return null;

  const start = async (provider: SocialProvider) => {
    setPending(provider);
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: next,
        errorCallbackURL: `/login?error=oauth`,
      });
      if (error) {
        setPending(null);
        onError(authErrorMessage(error, `Couldn't start ${PROVIDER_LABELS[provider]} sign-in.`));
      }
    } catch (err: unknown) {
      setPending(null);
      onError(err instanceof Error ? err.message : `Failed to authenticate with ${PROVIDER_LABELS[provider]}.`);
    }
  };

  return (
    <div className={cn(variant === "icon" ? "grid grid-cols-4 gap-2" : "flex flex-col gap-2.5")}>
      {providers.map((provider) => (
        <button
          key={provider}
          type="button"
          onClick={() => start(provider)}
          disabled={pending !== null}
          aria-label={`Continue with ${PROVIDER_LABELS[provider]}`}
          className={cn(
            "inline-flex items-center justify-center gap-2 border border-border bg-surface font-medium text-foreground transition-all hover:bg-muted/80 disabled:opacity-60",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
            variant === "icon" ? "h-10 rounded-md" : "h-10 w-full rounded-md px-4 text-xs"
          )}
        >
          {pending === provider ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <span className="text-xs capitalize font-medium">{provider}</span>
          )}
          {variant === "full" && `Continue with ${PROVIDER_LABELS[provider]}`}
        </button>
      ))}
    </div>
  );
}
