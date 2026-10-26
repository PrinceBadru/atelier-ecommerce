"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { SpotlightCard } from "@/components/landing/SpotlightCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Check,
  Compass,
  SlidersHorizontal,
  Bot,
} from "lucide-react";
import type { RecommendedProduct, RecommendationResponse } from "@/lib/ai/recommendations";

export function PersonalizedRecommendations() {
  const [data, setData] = React.useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [addedIds, setAddedIds] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch("/api/recommendations");
        if (res.ok) {
          const json: RecommendationResponse = await res.json();
          if (isMounted) setData(json);
        }
      } catch (err) {
        console.warn("Failed to load recommendations:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickAdd = async (e: React.MouseEvent, item: RecommendedProduct) => {
    e.preventDefault();
    e.stopPropagation();

    setAddedIds((prev) => ({ ...prev, [item.id]: true }));

    window.dispatchEvent(
      new CustomEvent("atelier:add-to-cart", {
        detail: {
          productId: item.id,
          name: item.name,
          priceCents: item.priceCents,
          imageUrl: item.imageUrl,
        },
      })
    );

    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 2200);
  };

  if (loading) {
    return (
      <section className="py-24 bg-surface/20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          <div className="h-6 w-48 bg-muted rounded-full" />
          <div className="h-10 w-96 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-muted/50 rounded-2xl border border-border/40" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data || data.items.length === 0) return null;

  return (
    <section className="py-24 bg-surface/30 border-b border-border relative overflow-hidden">
      {/* Background Ambient Flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Header with Personalization Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/40 bg-accent/10 text-xs font-mono uppercase tracking-wider text-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{data.isPersonalized ? "AI Semantic Taste Vector" : "Curated Recommendations"}</span>
            </div>
            <h2 className="font-display text-scale-32 sm:text-scale-48 font-normal tracking-tight text-foreground">
              {data.userTitle}
            </h2>
            <p className="text-xs sm:text-scale-16 text-muted-foreground max-w-xl">
              {data.userTasteSummary}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {data.isPersonalized ? (
              <Link href="/account">
                <Button variant="outline" size="sm" className="text-xs gap-1.5 border-accent/40 text-accent hover:bg-accent/10">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Refine Taste Profile</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-accent" />
                  <span>Sign In to Personalize</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Recommended Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.slice(0, 6).map((item) => (
            <Link key={item.id} href={`/products`} className="group block h-full">
              <SpotlightCard className="h-full flex flex-col justify-between p-5 bg-surface/90">
                <div className="space-y-4">
                  {/* Image with Match Tag Overlay */}
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                        Handcrafted Object
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/95 backdrop-blur-md text-[11px] font-mono font-semibold text-accent border border-accent/50 shadow-[0_0_15px_-2px_hsl(var(--accent)/0.4)]">
                        <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                        <span>{item.matchScore}% Taste Match</span>
                      </span>
                    </div>

                    <span className="absolute top-2.5 right-2.5 text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-background/85 backdrop-blur-md text-foreground border border-border/60">
                      {item.categoryName}
                    </span>
                  </div>

                  {/* Title & Match Reason */}
                  <div className="space-y-1.5">
                    <h3 className="font-display text-scale-18 font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-accent/90 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3 text-success flex-shrink-0" />
                      <span>{item.matchReason}</span>
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-5 border-t border-border/60 flex items-center justify-between mt-4">
                  <span className="font-mono text-scale-16 font-semibold text-foreground">
                    {formatPrice(item.priceCents)}
                  </span>

                  <Button
                    size="sm"
                    variant={addedIds[item.id] ? "accent" : "outline"}
                    onClick={(e) => handleQuickAdd(e, item)}
                    className="text-xs gap-1.5"
                  >
                    {addedIds[item.id] ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
                      </>
                    )}
                  </Button>
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
