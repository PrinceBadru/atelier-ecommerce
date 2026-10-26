"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  User,
  Menu,
  X,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function StorefrontHeader() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [cartCount, setCartCount] = React.useState<number>(0);
  const [cartPop, setCartPop] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Sync scroll elevation
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync cart count
  const refreshCartCount = React.useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        const total = (data.items || []).reduce(
          (sum: number, item: { quantity: number }) => sum + (item.quantity || 1),
          0
        );
        setCartCount(total);
      }
    } catch {
      // Ignore background fetch errors
    }
  }, []);

  React.useEffect(() => {
    refreshCartCount();

    const handleAdd = () => {
      refreshCartCount();
      setCartPop(true);
      setTimeout(() => setCartPop(false), 500);
    };

    window.addEventListener("atelier:add-to-cart", handleAdd);
    return () => window.removeEventListener("atelier:add-to-cart", handleAdd);
  }, [refreshCartCount]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "All Goods", href: "/products" },
    { label: "Ceramics & Living", href: "/products?category=ceramics-tableware" },
    { label: "Linen & Textiles", href: "/products?category=linen-textiles" },
    { label: "Cookware", href: "/products?category=cast-iron-cookware" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-surface/90 backdrop-blur-xl border-b border-border shadow-elevation2 py-0"
            : "bg-surface/75 backdrop-blur-md border-b border-border/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="font-display text-scale-24 font-normal tracking-tight hover:opacity-85 transition-opacity flex items-center gap-2"
            >
              <span>Atelier</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-xs text-muted-foreground">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-colors hover:text-foreground ${
                      isActive ? "text-foreground font-medium" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions, Theme Switcher & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Visual Theme Switcher */}
            <ThemeToggle />

            {/* Dynamic Customer Auth State */}
            {session?.user ? (
              <Link href="/account">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {session.user.name?.split(" ")[0] || "Account"}
                  </span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}

            {/* Shopping Bag with Dynamic Counter & Pop Animation */}
            <Link href="/cart">
              <Button
                variant="outline"
                size="sm"
                className={`text-xs gap-1.5 relative transition-all duration-300 ${
                  cartPop ? "scale-105 border-accent text-accent" : ""
                }`}
              >
                <ShoppingBag className={`w-3.5 h-3.5 ${cartPop ? "animate-bounce" : ""}`} />
                <span className="hidden sm:inline">Bag</span>
                {cartCount > 0 && (
                  <span
                    className={`ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none bg-accent text-accent-foreground rounded-full transition-transform ${
                      cartPop ? "animate-cart-pop scale-125" : ""
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Hamburger Trigger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-border bg-surface px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground py-1 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Theme Preference</span>
              <ThemeToggle />
            </div>

            <div className="pt-2">
              <Link href="/products" className="block">
                <Button size="sm" className="w-full text-xs">
                  Explore Full Catalog <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
