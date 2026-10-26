"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { SpotlightCard } from "@/components/landing/SpotlightCard";
import { ArrowRight, Sparkles } from "lucide-react";

const COLLECTIONS = [
  {
    title: "Ceramics & Tableware",
    desc: "Wood-fired stoneware and glazed vessels crafted by Kyoto and Mino artisans.",
    badge: "40+ Objects",
    href: "/products?category=ceramics-tableware",
    imageUrl:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    provenance: "Kyoto & Mino, Japan",
  },
  {
    title: "Linen & Textiles",
    desc: "Oeko-Tex certified Belgian flax spun for bedroom sanctuary and dining table.",
    badge: "35+ Objects",
    href: "/products?category=linen-textiles",
    imageUrl:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    provenance: "Flanders, Belgium",
  },
  {
    title: "Cast Iron & Cookware",
    desc: "Pre-seasoned sand-cast dutch ovens and carbon steel skillets for open fire and hearth.",
    badge: "35+ Objects",
    href: "/products?category=cast-iron-cookware",
    imageUrl:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    provenance: "Portland & Oregon Mills",
  },
  {
    title: "Waxed Canvas & Bags",
    desc: "Heavyweight weather-resistant field bags and haversacks engineered for the journey.",
    badge: "40+ Objects",
    href: "/products?category=waxed-canvas-bags",
    imageUrl:
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80",
    provenance: "Dundee, Scotland",
  },
];

export function CuratedCollections() {
  return (
    <section className="py-24 bg-background border-b border-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-accent font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Workshop Disciplines</span>
            </div>
            <h2 className="font-display text-scale-32 sm:text-scale-48 font-normal tracking-tight text-foreground">
              Curated Collections
            </h2>
          </div>
          <Link
            href="/products"
            className="group text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <span>Explore full atelier catalog</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3D Spotlight Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLLECTIONS.map((col) => (
            <Link key={col.title} href={col.href} className="group block h-full">
              <SpotlightCard className="h-full flex flex-col justify-between p-6">
                {/* Image Preview with Hover Zoom & Floating Pill Reveal */}
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden mb-5 bg-muted">
                  <Image
                    src={col.imageUrl}
                    alt={col.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-115 will-change-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-md text-foreground border border-border/80 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    {col.badge}
                  </span>

                  {/* Center Floating Glass Reveal on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-background/90 backdrop-blur-md text-xs font-medium text-foreground border border-accent/40 shadow-elevation2">
                      <span>Explore Workshop</span>
                      <ArrowRight className="w-3.5 h-3.5 text-accent" />
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 flex-1">
                  <span className="text-[11px] font-mono text-accent uppercase tracking-wider block">
                    {col.provenance}
                  </span>
                  <h3 className="font-display text-scale-20 font-medium text-foreground group-hover:text-accent transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {col.desc}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="pt-6 border-t border-border/60 flex items-center justify-between text-xs font-medium text-foreground group-hover:text-accent transition-colors">
                  <span>View Objects</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5 text-accent" />
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
