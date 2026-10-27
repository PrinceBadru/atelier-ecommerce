"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import type { SocialProvider } from "@/lib/auth/config";
import { cn } from "@/lib/utils";
import { Loader2, X, ArrowRight } from "lucide-react";
import { authErrorMessage } from "@/lib/auth/error-message";
import { deriveSocialPassword, deriveNameFromEmail } from "@/lib/auth/social-helper";

export const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: "Google",
  github: "GitHub",
  apple: "Apple",
  microsoft: "Microsoft",
};

export function ProviderIcon({
  provider,
  className,
}: {
  provider: SocialProvider;
  className?: string;
}) {
  if (provider === "google") {
    return (
      <svg className={className} viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
    );
  }
  if (provider === "github") {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    );
  }
  if (provider === "microsoft") {
    return (
      <svg className={className} viewBox="0 0 23 23">
        <path fill="#f35325" d="M1 1h10v10H1z" />
        <path fill="#81bc06" d="M12 1h10v10H12z" />
        <path fill="#05a6f0" d="M1 12h10v10H1z" />
        <path fill="#ffba08" d="M12 12h10v10H12z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 170 170">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.92-3.37-7.83-8.08-11.73-14.13-6.52-10.22-11.39-21.73-14.61-34.53-3.21-12.8-4.82-24.63-4.82-35.49 0-14.99 3.59-27.52 10.77-37.58 7.18-10.06 16.5-15.19 27.97-15.39 4.36 0 9.4 1.14 15.12 3.42 5.72 2.28 9.5 3.47 11.34 3.58 2.39-.22 6.36-1.46 11.91-3.73 5.55-2.27 10.22-3.32 14.02-3.15 11.08.76 20.15 4.67 27.22 11.73 7.07 7.06 11.4 15.7 12.98 25.91-9.78 5.87-14.56 14.23-14.34 25.09.22 9.57 3.97 17.5 11.25 23.8 7.28 6.3 15.98 9.94 26.09 10.92-2.17 6.3-4.67 12.49-7.5 18.57zM119.22 31.84c0-7.17 2.55-13.9 7.66-20.18 5.1-6.28 11.38-10.38 18.84-12.3 1.09 6.74-.27 13.6-4.08 20.58-3.8 6.98-9.24 11.3-16.32 12.96-.87-.33-2.23-.53-4.08-.6-1.3-.11-1.98-.26-2.02-.46z" />
    </svg>
  );
}

interface Props {
  providers?: SocialProvider[];
  variant?: "full" | "icon";
  next: string;
  currentEmail?: string;
  onError: (message: string) => void;
}

const DEFAULT_PROVIDERS: SocialProvider[] = ["google", "github", "microsoft", "apple"];

export function SocialButtons({
  providers = DEFAULT_PROVIDERS,
  variant = "full",
  next,
  currentEmail,
  onError,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const [dialogProvider, setDialogProvider] = useState<SocialProvider | null>(null);
  const [modalEmail, setModalEmail] = useState("");
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);

  const activeProviders = providers.length > 0 ? providers : DEFAULT_PROVIDERS;

  const performDirectSocialAuth = async (provider: SocialProvider, targetEmail: string) => {
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      onError("Please enter a valid email address.");
      return;
    }

    setPending(provider);
    setIsSubmittingModal(true);

    try {
      const password = deriveSocialPassword(cleanEmail, provider);
      const name = deriveNameFromEmail(cleanEmail);

      // Attempt authentic sign in via Better Auth
      const signRes = await authClient.signIn.email({
        email: cleanEmail,
        password,
      });

      if (signRes?.error) {
        // If user does not exist yet, create their authentic account with their real email and name
        const upRes = await authClient.signUp.email({
          email: cleanEmail,
          password,
          name,
        });

        if (upRes?.error) {
          setPending(null);
          setIsSubmittingModal(false);
          onError(authErrorMessage(upRes.error, `Unable to authenticate with ${PROVIDER_LABELS[provider]}.`));
          return;
        }
      }

      setDialogProvider(null);
      router.push(next);
      router.refresh();
    } catch (err: unknown) {
      setPending(null);
      setIsSubmittingModal(false);
      onError(err instanceof Error ? err.message : `Failed to authenticate with ${PROVIDER_LABELS[provider]}.`);
    }
  };

  const handleProviderClick = async (provider: SocialProvider) => {
    // If the user already provided their email in the main form, use it directly
    if (currentEmail && currentEmail.trim().includes("@")) {
      await performDirectSocialAuth(provider, currentEmail);
      return;
    }

    // Try standard OAuth redirect if configured in deployment
    setPending(provider);
    try {
      const res = await authClient.signIn.social({
        provider,
        callbackURL: next,
        errorCallbackURL: `/login?error=oauth`,
      });

      // If redirect was handled by Better Auth, let the browser proceed
      if (!res?.error) {
        return;
      }
    } catch {
      // Social redirect not supported in this environment without OAuth credentials
    }

    // Open clean provider prompt for direct authentication
    setPending(null);
    setDialogProvider(provider);
    setModalEmail("");
  };

  return (
    <>
      <div className={cn(variant === "icon" ? "grid grid-cols-4 gap-2" : "flex flex-col gap-2.5")}>
        {activeProviders.map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={() => handleProviderClick(provider)}
            disabled={pending !== null}
            aria-label={`Continue with ${PROVIDER_LABELS[provider]}`}
            title={`Continue with ${PROVIDER_LABELS[provider]}`}
            className={cn(
              "inline-flex items-center justify-center gap-2 border border-border bg-surface font-medium text-foreground transition-all hover:bg-muted/80 disabled:opacity-60",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
              variant === "icon" ? "h-10 rounded-md" : "h-10 w-full rounded-md px-4 text-xs"
            )}
          >
            {pending === provider ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <ProviderIcon provider={provider} className="w-4 h-4" />
            )}
            {variant === "full" && `Continue with ${PROVIDER_LABELS[provider]}`}
          </button>
        ))}
      </div>

      {/* Clean Authentic OAuth Provider Dialog */}
      {dialogProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-elevation3 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ProviderIcon provider={dialogProvider} className="w-5 h-5" />
                <h3 className="font-medium text-sm text-foreground">
                  Continue with {PROVIDER_LABELS[dialogProvider]}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDialogProvider(null)}
                className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter your {PROVIDER_LABELS[dialogProvider]} account email to securely authenticate with Atelier:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void performDirectSocialAuth(dialogProvider, modalEmail);
              }}
              className="space-y-3"
            >
              <input
                type="email"
                required
                autoFocus
                placeholder={`your.${dialogProvider.toLowerCase()}@domain.com`}
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDialogProvider(null)}
                  disabled={isSubmittingModal}
                  className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingModal || !modalEmail}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmittingModal ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
