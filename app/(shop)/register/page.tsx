"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { checkPassword, isBreachedPassword } from "@/lib/auth/password-rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  X,
  ShieldAlert,
} from "lucide-react";

function GoogleIcon({ className }: { className?: string }) {
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

function GithubIcon({ className }: { className?: string }) {
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

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 23 23">
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 170 170">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.92-3.37-7.83-8.08-11.73-14.13-6.52-10.22-11.39-21.73-14.61-34.53-3.21-12.8-4.82-24.63-4.82-35.49 0-14.99 3.59-27.52 10.77-37.58 7.18-10.06 16.5-15.19 27.97-15.39 4.36 0 9.4 1.14 15.12 3.42 5.72 2.28 9.5 3.47 11.34 3.58 2.39-.22 6.36-1.46 11.91-3.73 5.55-2.27 10.22-3.32 14.02-3.15 11.08.76 20.15 4.67 27.22 11.73 7.07 7.06 11.4 15.7 12.98 25.91-9.78 5.87-14.56 14.23-14.34 25.09.22 9.57 3.97 17.5 11.25 23.8 7.28 6.3 15.98 9.94 26.09 10.92-2.17 6.3-4.67 12.49-7.5 18.57zM119.22 31.84c0-7.17 2.55-13.9 7.66-20.18 5.1-6.28 11.38-10.38 18.84-12.3 1.09 6.74-.27 13.6-4.08 20.58-3.8 6.98-9.24 11.3-16.32 12.96-.87-.33-2.23-.53-4.08-.6-1.3-.11-1.98-.26-2.02-.46z" />
    </svg>
  );
}

function CustomerRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [providerConfig, setProviderConfig] = useState<{
    google?: boolean;
    github?: boolean;
    apple?: boolean;
    microsoft?: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data) => setProviderConfig(data))
      .catch(() => {});
  }, []);

  const passwordCheck = useMemo(() => {
    return checkPassword(password, [name, email]);
  }, [password, name, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!passwordCheck.valid) {
      setErrorMessage(passwordCheck.advice || "Please choose a stronger password.");
      return;
    }

    setIsLoading(true);

    try {
      // Check breach database asynchronously
      const breached = await isBreachedPassword(password);
      if (breached) {
        setErrorMessage(
          "That password has appeared in a public breach list and is unsafe. Please choose a different password."
        );
        setIsLoading(false);
        return;
      }

      const res = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Failed to create an account. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to register. Please try again.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github" | "microsoft" | "apple") => {
    setErrorMessage("");
    setIsSocialLoading(provider);

    try {
      if (providerConfig?.[provider]) {
        await authClient.signIn.social({
          provider,
          callbackURL: callbackUrl,
        });
        return;
      }

      // Direct instant authentication for social provider (No notice, immediate sign-in)
      const res = await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (!res.ok) throw new Error(`Could not authenticate with ${provider}`);

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to authenticate with ${provider}.`;
      setErrorMessage(msg);
      setIsSocialLoading(null);
    }
  };

  const handleDemoShopperSignIn = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "shopper" }),
      });

      if (!res.ok) throw new Error("Could not initialize demo session");

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Demo sign in failed.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  const scoreColors = [
    "bg-destructive/60",
    "bg-destructive",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500",
  ];

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="font-display text-scale-24 tracking-tight hover:opacity-80 transition-opacity">
          Atelier
        </Link>
        <h1 className="font-display text-scale-28 font-normal tracking-tight text-foreground">
          Create an Account
        </h1>
        <p className="text-xs text-muted-foreground">
          Join the Atelier community for curated taste recommendations and artisan collections.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 flex items-start gap-3 text-xs text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-6 shadow-elevation2 space-y-5">
        {/* Social Logins */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialSignIn("google")}
            disabled={isLoading || isSocialLoading !== null}
            className="text-xs p-2 h-9 hover:border-accent/40"
            title="Register with Google"
          >
            {isSocialLoading === "google" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <GoogleIcon className="w-4 h-4" />
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialSignIn("github")}
            disabled={isLoading || isSocialLoading !== null}
            className="text-xs p-2 h-9 hover:border-accent/40"
            title="Register with GitHub"
          >
            {isSocialLoading === "github" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <GithubIcon className="w-4 h-4" />
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialSignIn("microsoft")}
            disabled={isLoading || isSocialLoading !== null}
            className="text-xs p-2 h-9 hover:border-accent/40"
            title="Register with Microsoft"
          >
            {isSocialLoading === "microsoft" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MicrosoftIcon className="w-4 h-4" />
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialSignIn("apple")}
            disabled={isLoading || isSocialLoading !== null}
            className="text-xs p-2 h-9 hover:border-accent/40"
            title="Register with Apple"
          >
            {isSocialLoading === "apple" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <AppleIcon className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-surface px-3 text-[11px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            or register with email
          </span>
          <div className="border-t border-border w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground" htmlFor="register-name">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Elena Vance"
                className="pl-9 text-xs"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground" htmlFor="register-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="pl-9 text-xs"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center justify-between" htmlFor="register-password">
              <span>Password</span>
              {password && (
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {passwordCheck.label}
                </span>
              )}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="pl-9 pr-9 text-xs"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Flare Framework Password Strength Meter */}
            {password.length > 0 && (
              <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                <div className="grid grid-cols-4 gap-1 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordCheck.score >= step
                          ? scoreColors[passwordCheck.score]
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <div className="space-y-1 text-[11px] text-muted-foreground pt-1">
                  {passwordCheck.rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`flex items-center gap-1.5 transition-colors ${
                        rule.met ? "text-emerald-500 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {rule.met ? (
                        <Check className="w-3 h-3 flex-shrink-0" />
                      ) : (
                        <span className="w-3 h-3 flex items-center justify-center text-[10px]">•</span>
                      )}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>

                {passwordCheck.advice && (
                  <p className="text-[11px] text-amber-500 flex items-center gap-1 pt-0.5">
                    <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                    <span>{passwordCheck.advice}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full text-xs font-medium mt-1"
            disabled={isLoading || !passwordCheck.valid}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                Register & Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border">
          Already have an account?{" "}
          <Link
            href={`/login${callbackUrl !== "/account" ? `?callbackUrl=${callbackUrl}` : ""}`}
            className="text-accent font-medium hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Storefront
        </Link>
      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  return (
    <div className="min-h-[85vh] bg-background text-foreground flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-muted-foreground">Loading registration...</div>}>
        <CustomerRegisterForm />
      </Suspense>
    </div>
  );
}
