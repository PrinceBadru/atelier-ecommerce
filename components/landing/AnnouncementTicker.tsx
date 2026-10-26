"use client";

import * as React from "react";
import { Sparkles, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import Link from "next/link";

const ANNOUNCEMENTS = [
  {
    icon: Truck,
    text: "Complimentary worldwide shipping on orders over $150",
    badge: "Shipping",
    link: "/products",
  },
  {
    icon: ShieldCheck,
    text: "Small-batch stoneware & Belgian flax from verified artisan workshops",
    badge: "Provenance",
    link: "/products?category=ceramics-tableware",
  },
  {
    icon: Sparkles,
    text: "Interactive Studio Curator: In-stock answers & material guidance",
    badge: "Curator",
    link: "/products",
  },
];

export function AnnouncementTicker() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const current = ANNOUNCEMENTS[currentIndex];
  const Icon = current.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="bg-primary text-primary-foreground py-2 px-4 text-xs font-medium tracking-wide border-b border-primary/20 overflow-hidden select-none transition-colors"
      role="region"
      aria-label="Studio Announcements"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <Link
          href={current.link}
          className="group flex items-center gap-2.5 transition-all duration-500 hover:opacity-90"
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-foreground/15 text-[10px] uppercase font-mono tracking-wider text-primary-foreground">
            <Icon className="w-3 h-3 text-accent" />
            <span>{current.badge}</span>
          </span>

          <span
            key={currentIndex}
            className="inline-block animate-in fade-in slide-in-from-bottom-2 duration-500 font-sans text-xs text-primary-foreground/90 group-hover:text-primary-foreground"
          >
            {current.text}
          </span>

          <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
}
