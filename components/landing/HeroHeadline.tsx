"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Compass, Check } from "lucide-react";

export function HeroHeadline() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 py-20 sm:py-28">
      {/* 1. Staggered Pill Badge */}
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-surface/70 backdrop-blur-md text-xs text-muted-foreground shadow-elevation1 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-accent font-medium">
          Autumn 2026 Collection
        </span>
        <span className="text-border">|</span>
        <span className="hidden sm:inline text-foreground/80">Curated Artisan Editions</span>
      </div>

      {/* 2. Staggered Display Headline */}
      <h1
        style={{ transitionDelay: "150ms" }}
        className={`font-display text-scale-48 sm:text-scale-64 font-normal tracking-tight text-foreground max-w-4xl mx-auto leading-[1.08] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        Considered goods for everyday living and honest journeys.
      </h1>

      {/* 3. Staggered Subtitle */}
      <p
        style={{ transitionDelay: "280ms" }}
        className={`text-muted-foreground text-scale-16 sm:text-scale-20 max-w-2xl mx-auto font-sans leading-relaxed transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        Atelier pairs heirloom craftsmanship with mindful studio curation. Discover hand-thrown stoneware, Belgian linen, and hand-forged cookware built to endure for generations.
      </p>

      {/* 4. Interactive Magnetic CTA Buttons */}
      <div
        style={{ transitionDelay: "400ms" }}
        className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <Link href="/products" className="w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto text-scale-16 px-8 py-3.5 bg-foreground text-background hover:bg-foreground/90 font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-elevation2 group"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
        <Link href="/products?category=ceramics-tableware" className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto text-scale-16 px-8 py-3.5 border-border/80 bg-surface/60 backdrop-blur-sm hover:bg-surface hover:border-accent/60 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Ceramics & Tableware</span>
          </Button>
        </Link>
      </div>

      {/* 5. Trust Micro-Indicators */}
      <div
        style={{ transitionDelay: "520ms" }}
        className={`pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-accent" />
          <span>Verified Workshop Provenance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-accent" />
          <span>Plastic-Free Recyclable Crates</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-accent" />
          <span>Lifetime Repair Guarantee</span>
        </div>
      </div>
    </div>
  );
}
