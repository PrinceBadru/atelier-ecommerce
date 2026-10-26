"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";

interface ShowcaseItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  priceCents: number;
  imageUrl: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "item-1",
    name: "Hand-Thrown Stoneware Pour-Over Dripper",
    slug: "hand-thrown-stoneware-pour-over-dripper-1",
    category: "Ceramics",
    priceCents: 4800,
    imageUrl:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "item-2",
    name: "Belgian Flax Linen Throw Blanket",
    slug: "belgian-linen-fringe-throw-blanket-2",
    category: "Textiles",
    priceCents: 14500,
    imageUrl:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "item-3",
    name: "Pre-Seasoned Cast Iron Hearth Skillet",
    slug: "cast-iron-hearth-skillet-10-inch-3",
    category: "Cookware",
    priceCents: 9500,
    imageUrl:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "item-4",
    name: "Mino Ware Stoneware Yunomi Tea Cup",
    slug: "mino-ware-ceramic-yunomi-tea-cup-4",
    category: "Ceramics",
    priceCents: 3400,
    imageUrl:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "item-5",
    name: "Heavy Waxed Canvas Expedition Haversack",
    slug: "waxed-canvas-expedition-haversack-5",
    category: "Expedition",
    priceCents: 18000,
    imageUrl:
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "item-6",
    name: "Raw Volcanic Clay Serving Vessel",
    slug: "raw-volcanic-clay-serving-vessel-6",
    category: "Ceramics",
    priceCents: 7800,
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80",
  },
];

export function ArtisanShowcaseReel() {
  // Duplicate array to enable seamless 50% translation infinite loop
  const reelItems = [...SHOWCASE_ITEMS, ...SHOWCASE_ITEMS];

  return (
    <section className="py-20 border-b border-border bg-surface/40 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-medium">
            Recent Workshop Batches
          </span>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Hover to pause & inspect
        </span>
      </div>

      {/* Edge gradient masks for continuous infinite fade effect */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent z-10" />

      {/* Marquee Track */}
      <div className="animate-atelier-marquee gap-6 px-4">
        {reelItems.map((item, index) => (
          <Link
            key={`${item.id}-${index}`}
            href={`/products`}
            className="group relative w-64 sm:w-72 flex-shrink-0 rounded-2xl border border-border/80 bg-surface p-4 shadow-elevation1 transition-all duration-500 hover:border-accent/60 hover:shadow-elevation3 hover:-translate-y-1 block"
          >
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted mb-3">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 256px, 288px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <span className="absolute top-2 left-2 text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-background/85 backdrop-blur-md text-foreground border border-border/60">
                {item.category}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-display text-scale-16 font-medium text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                {item.name}
              </h4>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-mono font-semibold text-foreground">
                  {formatPrice(item.priceCents)}
                </span>
                <span className="text-accent text-[11px] font-medium flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Acquire <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
