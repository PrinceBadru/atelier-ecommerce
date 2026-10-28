"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SocialButtons } from "@/components/auth/social-buttons";
import type { SocialProvider } from "@/lib/auth/config";
import { authErrorMessage } from "@/lib/auth/error-message";
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
  ShieldCheck,
} from "lucide-react";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [providers, setProviders] = useState<SocialProvider[]>([]);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((res) => res.json())
      .then((data: any) => {
        if (Array.isArray(data.providers)) {
          setProviders(data.providers);
        }
      })
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
        setErrorMessage(authErrorMessage(res.error, "Invalid email or password."));
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
        setErrorMessage(authErrorMessage(res.error, "Failed to send verification code."));
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
        setErrorMessage(authErrorMessage(res.error, "Invalid or expired 6-digit code."));
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
        setErrorMessage(authErrorMessage(res.error, "Could not send magic link."));
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
        setErrorMessage(authErrorMessage(res.error, "That passkey didn't work. Try again or use your email."));
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

  // 5. One-Click Test & Admin Quick Access
  const handleDemoSignIn = async (role: "shopper" | "admin" = "shopper") => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error("Could not initialize test session");

      router.push(role === "admin" ? "/admin" : callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Test user sign in failed.";
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

      <div className="rounded-xl border border-border bg-surface p-6 shadow-elevation2 space-y-5">
        {/* Flare Framework Option A: Social buttons only render if configured in environment */}
        {providers.length > 0 && (
          <div>
            <SocialButtons
              providers={providers}
              variant="icon"
              next={callbackUrl}
              onError={(err) => setErrorMessage(err)}
            />

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-border w-full" />
              <span className="bg-surface px-3 text-[11px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                or choose method
              </span>
              <div className="border-t border-border w-full" />
            </div>
          </div>
        )}

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

        {/* One-Click Test Accounts */}
        <div className="pt-4 border-t border-border space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">One-Click Test Accounts</span>
            <span className="text-[10px] bg-accent/10 text-accent font-medium px-2 py-0.5 rounded-full">Instant Access</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoSignIn("shopper")}
              disabled={isLoading}
              className="w-full text-xs hover:border-accent/50 gap-1.5 h-9"
              title="Sign in as Test User (Shopper Demo)"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Test User</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDemoSignIn("admin")}
              disabled={isLoading}
              className="w-full text-xs hover:border-amber-500/50 gap-1.5 h-9"
              title="Sign in as Studio Admin"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Studio Admin</span>
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-1">
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
