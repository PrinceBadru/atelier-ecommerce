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
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Wand2,
  KeyRound,
  Fingerprint,
  CheckCircle2,
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

type AuthMode = "password" | "emailOtp" | "magicLink" | "passkey";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [authMode, setAuthMode] = useState<AuthMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [providerConfig, setProviderConfig] = useState<{
    google?: boolean;
    github?: boolean;
    apple?: boolean;
    microsoft?: boolean;
    renderUrl?: string;
  } | null>(null);
  const [oauthNotice, setOauthNotice] = useState<{ provider: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data) => setProviderConfig(data))
      .catch(() => {});
  }, []);

  // 1. Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Invalid email or password.");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to sign in. Please try again.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  // 2. Email OTP Flow (Send code + Verify code)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter your email address first.");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Failed to send verification code.");
        setIsLoading(false);
        return;
      }

      setOtpSent(true);
      setIsLoading(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Could not send OTP code.");
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMessage("Please enter the 6-digit code received.");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await authClient.signIn.emailOtp({
        email,
        otp: otpCode,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Invalid or expired 6-digit code.");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to verify code.");
      setIsLoading(false);
    }
  };

  // 3. Magic Link Flow
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await authClient.signIn.magicLink({
        email,
        callbackURL: callbackUrl,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Could not send magic link.");
        setIsLoading(false);
        return;
      }

      setMagicLinkSent(true);
      setIsLoading(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send magic link.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  // 4. Passkey Flow (Biometric / Security Key)
  const handlePasskeySignIn = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await authClient.signIn.passkey();
      if (res?.error) {
        setErrorMessage(res.error.message || "Passkey authentication was cancelled or not recognized.");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Passkey sign-in failed.");
      setIsLoading(false);
    }
  };

  // 5. Social Providers
  const handleSocialSignIn = async (provider: "google" | "github" | "microsoft" | "apple") => {
    setErrorMessage("");
    if (!providerConfig?.[provider]) {
      const names: Record<string, string> = {
        google: "Google",
        github: "GitHub",
        microsoft: "Microsoft",
        apple: "Apple",
      };
      setOauthNotice({ provider: names[provider] || provider });
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

  // 6. Demo Session Bypass
  const handleDemoSignIn = async (role: "shopper" | "admin" = "shopper") => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error("Could not initialize demo session");

      router.push(role === "admin" ? "/admin" : callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Demo sign in failed.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="font-display text-scale-24 tracking-tight hover:opacity-80 transition-opacity">
          Atelier
        </Link>
        <h1 className="font-display text-scale-28 font-normal tracking-tight text-foreground">
          Welcome Back
        </h1>
        <p className="text-xs text-muted-foreground">
          Sign in to access your orders, taste preferences, and account security.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 flex items-start gap-3 text-xs text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {magicLinkSent && (
        <div className="rounded-lg border border-success/40 bg-success/10 p-4 text-xs text-success space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <Wand2 className="w-4 h-4" /> Magic Link Dispatched
          </div>
          <p className="text-foreground/80 leading-relaxed">
            We have dispatched a secure sign-in link to <span className="font-medium underline">{email}</span>. Click the link in your email to authenticate instantly.
          </p>
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
            Live {oauthNotice.provider} sign-in requires registering an OAuth Client ID in your {oauthNotice.provider} Developer Console with redirect URI:
          </p>
          <div className="rounded bg-background/80 p-2 font-mono text-[10px] border border-border select-all break-all text-foreground">
            https://atelier-web-5swv.onrender.com/api/auth/callback/{oauthNotice.provider.toLowerCase()}
          </div>
          <p className="text-muted-foreground text-[11px]">
            To bypass external OAuth and experience the entire store immediately, click below:
          </p>
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={() => handleDemoSignIn("shopper")}
            disabled={isLoading}
            className="w-full text-xs gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Enter Immediately as Shopper (1-Click)</span>
          </Button>
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
            title="Sign in with Google"
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
            title="Sign in with GitHub"
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
            title="Sign in with Microsoft"
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
            title="Sign in with Apple"
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
            or choose method
          </span>
          <div className="border-t border-border w-full" />
        </div>

        {/* Flare Framework Auth Mode Tabs */}
        <div className="grid grid-cols-4 p-1 bg-muted/40 rounded-lg text-xs gap-0.5">
          <button
            type="button"
            onClick={() => {
              setAuthMode("password");
              setErrorMessage("");
            }}
            className={`py-1.5 px-1 rounded font-medium transition-all text-center truncate ${
              authMode === "password"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("emailOtp");
              setErrorMessage("");
            }}
            className={`py-1.5 px-1 rounded font-medium transition-all text-center truncate ${
              authMode === "emailOtp"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Email Code
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("magicLink");
              setErrorMessage("");
            }}
            className={`py-1.5 px-1 rounded font-medium transition-all text-center truncate ${
              authMode === "magicLink"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Magic Link
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("passkey");
              setErrorMessage("");
            }}
            className={`py-1.5 px-1 rounded font-medium transition-all text-center truncate flex items-center justify-center gap-1 ${
              authMode === "passkey"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5 inline" />
            <span>Passkey</span>
          </button>
        </div>

        {/* Tab 1: Password */}
        {authMode === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="customer-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customer-email"
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
              <label className="text-xs font-medium text-foreground flex items-center justify-between" htmlFor="customer-password">
                <span>Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="customer-password"
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
            </div>

            <Button type="submit" className="w-full text-xs font-medium mt-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Signing in...
                </>
              ) : (
                <>
                  Sign In with Password <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* Tab 2: Email Code (OTP) */}
        {authMode === "emailOtp" && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground" htmlFor="otp-email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="pl-9 text-xs"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    We will send a 6-digit one-time code to your inbox.
                  </p>
                </div>

                <Button type="submit" className="w-full text-xs font-medium" disabled={isLoading || !email}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Sending 6-digit code...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5 mr-1.5" /> Send 6-Digit Code
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-xs text-success flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Code sent to {email}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[11px] underline hover:opacity-80"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground" htmlFor="otp-code">
                    Enter 6-Digit Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.trim())}
                      placeholder="123456"
                      className="pl-9 text-base tracking-widest font-mono text-center"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full text-xs font-medium" disabled={isLoading || otpCode.length < 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Sign In <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isLoading}
                    className="text-[11px] text-muted-foreground hover:text-foreground underline"
                  >
                    Didn&apos;t receive code? Resend
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 3: Magic Link */}
        {authMode === "magicLink" && (
          <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="magic-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="magic-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="pl-9 text-xs"
                  disabled={isLoading}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                We will email you a secure 5-minute single-use sign-in link.
              </p>
            </div>

            <Button type="submit" className="w-full text-xs font-medium" disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Sending link...
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5 mr-1.5" /> Send Magic Link
                </>
              )}
            </Button>
          </form>
        )}

        {/* Tab 4: Passkey */}
        {authMode === "passkey" && (
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Sign in with a Passkey</h3>
              <p className="text-xs text-muted-foreground">
                Use your device&apos;s Face ID, Touch ID, Windows Hello, or physical security key.
              </p>
            </div>

            <Button
              type="button"
              onClick={handlePasskeySignIn}
              disabled={isLoading}
              className="w-full text-xs font-medium gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Authenticating passkey...
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" /> Sign In with Passkey
                </>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground">
              Passkeys can be created and managed in your Account Security settings.
            </p>
          </div>
        )}

        {/* One-Click Demo Evaluator Shortcut */}
        <div className="pt-3 border-t border-border grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoSignIn("shopper")}
            disabled={isLoading}
            className="w-full text-[11px] text-muted-foreground hover:text-foreground border-dashed gap-1"
          >
            <Sparkles className="w-3 h-3 text-accent" />
            <span>Shopper Demo</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleDemoSignIn("admin")}
            disabled={isLoading}
            className="w-full text-[11px] text-muted-foreground hover:text-foreground border-dashed gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Studio Admin</span>
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register${callbackUrl !== "/account" ? `?callbackUrl=${callbackUrl}` : ""}`}
            className="text-accent font-medium hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping as Guest
        </Link>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="min-h-[85vh] bg-background text-foreground flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-muted-foreground">Loading sign-in...</div>}>
        <CustomerLoginForm />
      </Suspense>
    </div>
  );
}
