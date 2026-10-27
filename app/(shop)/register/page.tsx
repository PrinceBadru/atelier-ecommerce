"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { checkPassword, isBreachedPassword } from "@/lib/auth/password-rules";
import { authErrorMessage } from "@/lib/auth/error-message";
import { SocialButtons } from "@/components/auth/social-buttons";
import type { SocialProvider } from "@/lib/auth/config";
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

function CustomerRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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
        setErrorMessage(authErrorMessage(res.error, "Failed to create an account. Please try again."));
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
        {/* Social Authentication Methods (Only rendered when configured in environment, Flare pattern) */}
        {providers.length > 0 && (
          <>
            <SocialButtons
              providers={providers}
              variant="icon"
              next={callbackUrl}
              onError={(err) => setErrorMessage(err)}
            />

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-border w-full" />
              <span className="bg-surface px-3 text-[11px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                or register with email
              </span>
              <div className="border-t border-border w-full" />
            </div>
          </>
        )}

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
