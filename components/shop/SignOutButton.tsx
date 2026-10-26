"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={signingOut}
      className={`text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40 ${className || ""}`}
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{signingOut ? "Signing Out..." : "Sign Out"}</span>
    </Button>
  );
}
