"use client";

import * as React from "react";
import { SpotlightCard } from "@/components/landing/SpotlightCard";
import { ShieldCheck, Sparkles, Recycle, HeartHandshake } from "lucide-react";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Authentic Provenance",
    desc: "Small-batch stoneware, forged ironware, and organic linen sourced directly from verified independent workshops worldwide with zero mass production.",
    tag: "Direct Studio Sourcing",
  },
  {
    icon: Sparkles,
    title: "Intelligent Studio Curation",
    desc: "Ask our conversational curator for custom tableware pairings, material care guidance, and seasonal drop notifications grounded strictly in real inventory.",
    tag: "Measured Intelligence",
  },
  {
    icon: Recycle,
    title: "Enduring Stewardship",
    desc: "Goods designed to patina and improve with age, supported by plastic-free recyclable packaging, carbon-neutral shipping, and lifetime workshop repairs.",
    tag: "Lifetime Guarantee",
  },
];

export function ScrollRevealPillars() {
  return (
    <section className="py-24 bg-surface/30 border-b border-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-medium">
            Our Commitments
          </span>
          <h2 className="font-display text-scale-32 sm:text-scale-48 font-normal tracking-tight text-foreground">
            Crafted for Generations
          </h2>
          <p className="text-xs sm:text-scale-16 text-muted-foreground leading-relaxed">
            Every object in our collection satisfies strict benchmarks for material integrity, ethical wages, and timeless aesthetic utility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            const number = `0${idx + 1}`;
            return (
              <SpotlightCard
                key={pillar.title}
                className="group p-8 flex flex-col justify-between space-y-6 bg-surface hover:border-accent transition-all relative overflow-hidden"
              >
                {/* Large Background Watermark Numeral */}
                <span className="pointer-events-none absolute -bottom-4 -right-2 font-display text-[120px] font-normal leading-none text-muted/20 group-hover:text-accent/15 transition-colors select-none z-0">
                  {number}
                </span>

                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shadow-sm group-hover:scale-110 group-hover:bg-accent/20 group-hover:border-accent transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-scale-20 font-medium text-foreground group-hover:text-accent transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 relative z-10 flex items-center justify-between">
                  <span className="text-[11px] font-mono tracking-wider text-accent uppercase font-medium">
                    {pillar.tag}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground/60">
                    Pillar {number}
                  </span>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
