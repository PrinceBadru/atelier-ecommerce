"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth/client";
import { LogOut, ExternalLink, ShieldCheck } from "lucide-react";

interface AdminHeaderProps {
  userEmail?: string;
}

export function AdminHeader({ userEmail = "admin@atelier.dev" }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <Link href="/admin" className="font-display text-scale-20 text-foreground flex items-center gap-2">
          <span>Atelier Studio</span>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 px-1.5 border-accent/40 text-accent">
            Admin
          </Badge>
        </Link>
        <nav className="flex items-center gap-5 text-xs font-medium">
          <Link
            href="/admin"
            className={`transition-colors ${
              pathname === "/admin" ? "text-accent font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className={`transition-colors ${
              pathname.startsWith("/admin/products")
                ? "text-accent font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Products
          </Link>
          <Link
            href="/admin/orders"
            className={`transition-colors ${
              pathname.startsWith("/admin/orders")
                ? "text-accent font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Orders
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/products" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1.5">
            Storefront <ExternalLink className="w-3 h-3" />
          </Button>
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-md border border-border">
          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
          <span className="font-mono text-[11px]">{userEmail}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
