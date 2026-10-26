"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Mail, KeyRound, ArrowRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

function TwoFactorChallenge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const [mode, setMode] = useState<"totp" | "email" | "backup">("totp");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      if (mode === "totp") {
        const res = await authClient.twoFactor.verifyTotp({ code });
        if (res.error) {
          setErrorMessage(res.error.message || "Invalid authenticator code.");
          setIsLoading(false);
          return;
        }
      } else if (mode === "email") {
        const res = await authClient.twoFactor.verifyOtp({ code });
        if (res.error) {
          setErrorMessage(res.error.message || "Invalid email verification code.");
          setIsLoading(false);
          return;
        }
      } else if (mode === "backup") {
        const res = await authClient.twoFactor.verifyBackupCode({ code });
        if (res.error) {
          setErrorMessage(res.error.message || "Invalid backup code.");
          setIsLoading(false);
          return;
        }
      }

      router.push(next);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Two-factor verification failed.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const res = await authClient.twoFactor.sendOtp();
      if (res.error) {
        setErrorMessage(res.error.message || "Failed to dispatch email 2FA code.");
        setIsLoading(false);
        return;
      }
      setEmailOtpSent(true);
      setIsLoading(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to send code.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-2">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="font-display text-2xl font-normal tracking-tight text-foreground">
          Two-Step Verification
        </h1>
        <p className="text-xs text-muted-foreground">
          Protecting your Atelier profile. Enter the code to continue.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 flex items-start gap-3 text-xs text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {emailOtpSent && (
        <div className="rounded-lg border border-success/40 bg-success/10 p-3 text-xs text-success">
          A 6-digit confirmation code has been dispatched to your email address.
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-6 shadow-elevation2 space-y-5">
        {/* Verification Method Tabs */}
        <div className="grid grid-cols-3 p-1 bg-muted/40 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("totp");
              setCode("");
              setErrorMessage("");
            }}
            className={`py-1.5 rounded-md font-medium transition-all ${
              mode === "totp"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Authenticator
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("email");
              setCode("");
              setErrorMessage("");
              if (!emailOtpSent) handleSendEmailOtp();
            }}
            className={`py-1.5 rounded-md font-medium transition-all ${
              mode === "email"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Email Code
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("backup");
              setCode("");
              setErrorMessage("");
            }}
            className={`py-1.5 rounded-md font-medium transition-all ${
              mode === "backup"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Backup Code
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "totp" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="totp-code">
                6-Digit Authenticator Code
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                  placeholder="123456"
                  className="pl-9 text-sm tracking-widest font-mono"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Open Google Authenticator, 1Password, or your preferred TOTP app.
              </p>
            </div>
          )}

          {mode === "email" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <label htmlFor="email-code">Email Verification Code</label>
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={isLoading}
                  className="text-accent hover:underline text-[11px]"
                >
                  Resend Code
                </button>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                  placeholder="123456"
                  className="pl-9 text-sm tracking-widest font-mono"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>
          )}

          {mode === "backup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="backup-code">
                One-Time Backup Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="backup-code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                  placeholder="e.g. 4a8f-9b2c"
                  className="pl-9 text-sm font-mono"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Use one of the recovery codes generated when two-factor was configured.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full text-xs font-medium" disabled={isLoading || !code}>
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                Verify and Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </form>

        <div className="pt-3 border-t border-border text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign-in options
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <div className="min-h-[85vh] bg-background text-foreground flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-muted-foreground">Loading 2FA verification...</div>}>
        <TwoFactorChallenge />
      </Suspense>
    </div>
  );
}
