"use client";

import * as React from "react";
import { Sparkles, MessageSquare, ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const CURATOR_PROMPTS = [
  {
    emoji: "☕",
    label: "Morning Rituals",
    prompt: "Recommend a pour-over dripper for morning coffee and describe its extraction characteristics.",
  },
  {
    emoji: "🎁",
    label: "Heirloom Gifts",
    prompt: "What are the best heirloom housewarming gifts under $150 with verified provenance?",
  },
  {
    emoji: "🍳",
    label: "Cast Iron Mastery",
    prompt: "How do I season and maintain a cast iron hearth skillet for open fire cooking?",
  },
  {
    emoji: "🌿",
    label: "Belgian Flax",
    prompt: "Tell me about the organic Belgian flax linen collection and how it softens over time.",
  },
];

export function CuratorPromptTeaser() {
  const [activePrompt, setActivePrompt] = React.useState<string | null>(null);

  const handlePromptClick = (prompt: string) => {
    setActivePrompt(prompt);
    window.dispatchEvent(
      new CustomEvent("atelier:open-assistant-prompt", {
        detail: { prompt },
      })
    );

    setTimeout(() => {
      setActivePrompt(null);
    }, 1200);
  };

  return (
    <section className="py-20 bg-surface/50 border-b border-border relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Kinetic Conic-Gradient Border Container */}
        <div className="relative p-[1.5px] rounded-3xl overflow-hidden shadow-elevation3">
          {/* Continuous Spinning Luminous Light Beam */}
          <div
            className="absolute inset-[-100%] animate-conic-spin pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, hsl(var(--accent) / 0.8) 330deg, hsl(var(--foreground)) 360deg)",
            }}
          />

          {/* Card Body */}
          <div className="relative rounded-[22px] bg-surface p-8 sm:p-12 overflow-hidden border border-border/80">
            {/* Ambient Corner Sparkle Bloom */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/40 bg-accent/15 text-xs font-mono uppercase tracking-wider text-accent shadow-sm">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
                <span>Interactive Studio Intelligence</span>
              </div>

              <h3 className="font-display text-scale-28 sm:text-scale-36 font-normal tracking-tight text-foreground">
                Have questions about dimensions, workshop batches, or pairings?
              </h3>

              <p className="text-xs sm:text-scale-16 text-muted-foreground leading-relaxed">
                Our AI Studio Curator is powered by live Google Gemini models, strictly grounded in verified inventory, artisan notes, and material specifications. Click any question below to test live:
              </p>

              {/* Clickable Prompt Pills with Hover Micro-Bounce */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
                {CURATOR_PROMPTS.map((item) => {
                  const isActive = activePrompt === item.prompt;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handlePromptClick(item.prompt)}
                      className={`group text-left p-4 rounded-xl border transition-all duration-300 flex items-start justify-between gap-3 ${
                        isActive
                          ? "border-accent bg-accent/25 scale-[0.98] shadow-elevation1"
                          : "border-border/90 bg-surface/90 hover:border-accent hover:bg-surface hover:shadow-elevation2 hover:-translate-y-1 hover:scale-[1.01]"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base select-none transition-transform group-hover:scale-125 duration-300">
                            {item.emoji}
                          </span>
                          <span className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors">
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          &ldquo;{item.prompt}&rdquo;
                        </p>
                      </div>

                      <div className="flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:text-accent group-hover:bg-accent/20 transition-all duration-300">
                        <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
