"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
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
  const [providerConfig, setProviderConfig] = useState<{ google: boolean; github: boolean } | null>(null);
  const [oauthNotice, setOauthNotice] = useState<{ provider: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data) => setProviderConfig(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
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

  const handleSocialSignIn = async (provider: "google" | "github") => {
    setErrorMessage("");
    if (providerConfig && !providerConfig[provider]) {
      setOauthNotice({ provider: provider === "google" ? "Google" : "GitHub" });
      return;
    }
    setIsSocialLoading(provider);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: callbackUrl,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to authenticate with ${provider}.`;
      setErrorMessage(msg);
      setIsSocialLoading(null);
    }
  };

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
          Join the Atelier community for order tracking, expedited checkout, and curated artisan drops.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 flex items-start gap-3 text-xs text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {oauthNotice && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-foreground space-y-2.5 animate-in fade-in duration-200">
          <div className="font-semibold flex items-center justify-between text-amber-500">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{oauthNotice.provider} OAuth Setup Notice</span>
            </div>
            <button
              type="button"
              onClick={() => setOauthNotice(null)}
              className="text-muted-foreground hover:text-foreground text-xs p-1"
            >
              ✕
            </button>
          </div>
          <p className="text-muted-foreground leading-relaxed text-[11px]">
            Live {oauthNotice.provider} sign-in requires registering an OAuth Client ID in your {oauthNotice.provider} Developer Console:
          </p>
          <div className="rounded bg-background/80 p-2 font-mono text-[10px] border border-border select-all break-all text-foreground">
            https://atelier-web-5swv.onrender.com/api/auth/callback/{oauthNotice.provider.toLowerCase()}
          </div>
          <p className="text-muted-foreground text-[11px]">
            To register manually in 5 seconds, simply use the form below with your email and password.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-6 shadow-elevation2 space-y-5">
        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialSignIn("google")}
            disabled={isLoading || isSocialLoading !== null}
            className="w-full text-xs gap-2 font-normal hover:border-accent/40"
          >
            {isSocialLoading === "google" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <GoogleIcon className="w-4 h-4" />
            )}
            <span>Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocialSignIn("github")}
            disabled={isLoading || isSocialLoading !== null}
            className="w-full text-xs gap-2 font-normal hover:border-accent/40"
          >
            {isSocialLoading === "github" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <GithubIcon className="w-4 h-4" />
            )}
            <span>GitHub</span>
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
            <label className="text-xs font-medium text-foreground" htmlFor="register-password">
              Password (min. 8 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
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
          </div>

          <Button type="submit" className="w-full text-xs font-medium mt-1" disabled={isLoading}>
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
          <Link href={`/login${callbackUrl !== "/account" ? `?callbackUrl=${callbackUrl}` : ""}`} className="text-accent font-medium hover:underline">
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
