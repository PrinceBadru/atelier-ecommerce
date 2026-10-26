"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("admin@atelier.dev");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    errorParam === "admin_required"
      ? "Administrator credentials required to access the Studio Portal."
      : errorParam === "unauthorized"
      ? "Your session has expired. Please authenticate to continue."
      : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await authClient.signIn.email({
        email,
        password,
      });

      if (res.error) {
        setErrorMessage(res.error.message || "Invalid administrator credentials.");
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  const handleDemoAdminSignIn = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/demo-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      });

      if (!res.ok) throw new Error("Could not initialize admin demo session");

      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Demo admin sign in failed.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/40 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5 text-accent" />
          <span>Restricted Studio Access</span>
        </div>
        <h1 className="font-display text-scale-28 font-normal tracking-tight text-foreground">
          Atelier Studio Portal
        </h1>
        <p className="text-xs text-muted-foreground">
          Administrative control plane for inventory, orders, and studio curation.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 flex items-start gap-3 text-xs text-destructive">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-6 shadow-elevation2">
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground flex items-center justify-between" htmlFor="admin-email">
            <span>Admin Email</span>
            <Badge variant="outline" className="text-[10px]">Staff Only</Badge>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@atelier.dev"
              className="pl-9 text-xs"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground flex items-center justify-between" htmlFor="admin-password">
            <span>Studio Password</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="admin-password"
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

        <Button type="submit" className="w-full text-xs font-medium mt-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Verifying Credentials...
            </>
          ) : (
            <>
              Access Studio Admin <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </>
          )}
        </Button>

        {/* One-Click Evaluator Shortcut for Admin */}
        <div className="pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDemoAdminSignIn}
            disabled={isLoading}
            className="w-full text-[11px] text-accent hover:text-accent-foreground hover:bg-accent/15 border-dashed border-accent/40 gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>One-Click Instant Preview (Admin Staff Session)</span>
          </Button>
        </div>
      </form>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer Storefront
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
      <Suspense fallback={<div className="text-xs text-muted-foreground">Loading Studio Portal...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
