"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Check,
  Loader2,
  SlidersHorizontal,
  Bot,
  Layers,
  Wand2,
  CheckCircle2,
} from "lucide-react";

const DISCIPLINES = [
  { id: "ceramics-tableware", label: "Ceramics & Tableware" },
  { id: "linen-textiles", label: "Linen & Textiles" },
  { id: "cast-iron-cookware", label: "Cast Iron & Cookware" },
  { id: "waxed-canvas-bags", label: "Waxed Canvas & Carry" },
];

const STYLE_TAGS = [
  "Wabi-Sabi Minimalism",
  "Wood-Fired Stoneware",
  "Flemish Flax Linen",
  "Open Hearth Cookware",
  "Tactile Earthy Patina",
  "Expedition Weather-Resistance",
  "Kyoto Tea Ceremony",
  "Morning Coffee Rituals",
];

export function TasteProfileEditor() {
  const [preferredCategories, setPreferredCategories] = React.useState<string[]>([
    "ceramics-tableware",
  ]);
  const [styleAffinities, setStyleAffinities] = React.useState<string[]>([
    "Wabi-Sabi Minimalism",
    "Wood-Fired Stoneware",
  ]);
  const [tasteNotes, setTasteNotes] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Fetch initial preferences
  React.useEffect(() => {
    async function fetchPreferences() {
      try {
        const res = await fetch("/api/user/preferences");
        if (res.ok) {
          const data = await res.json();
          if (data.preferredCategories) setPreferredCategories(data.preferredCategories);
          if (data.styleAffinities) setStyleAffinities(data.styleAffinities);
          if (data.tasteNotes) setTasteNotes(data.tasteNotes);
        }
      } catch (err) {
        console.warn("Could not load preferences:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPreferences();
  }, []);

  const toggleCategory = (id: string) => {
    setPreferredCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleStyle = (style: string) => {
    setStyleAffinities((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredCategories,
          styleAffinities,
          tasteNotes,
        }),
      });

      if (!res.ok) throw new Error("Failed to save taste preferences");

      setSuccessMessage(
        "Taste profile updated! Your 768-dimensional AI vector has been re-indexed in pgvector."
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving preferences";
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 animate-pulse space-y-4">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="h-4 w-72 bg-muted/60 rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-accent/40 bg-surface p-6 sm:p-8 shadow-elevation1 space-y-6 relative overflow-hidden">
      {/* Background Flare */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-accent font-medium">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Semantic Recommendation Engine</span>
          </div>
          <h2 className="font-display text-scale-20 sm:text-scale-24 font-normal text-foreground">
            Artisan Taste Profile & Affinity Settings
          </h2>
          <p className="text-xs text-muted-foreground">
            Tell our AI curator which materials, disciplines, and aesthetics you prefer. We customize your storefront and vector search accordingly.
          </p>
        </div>

        <Badge variant="outline" className="text-xs border-accent/40 text-accent font-mono py-1 px-3 self-start sm:self-auto">
          768-Dim Active Vector
        </Badge>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-success/40 bg-success/10 p-3.5 flex items-center gap-2.5 text-xs text-success animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Preferred Disciplines */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground block">
            Favorite Craft Disciplines
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DISCIPLINES.map((cat) => {
              const selected = preferredCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-3 rounded-lg border text-xs text-left font-medium transition-all flex items-center justify-between gap-2 ${
                    selected
                      ? "border-accent bg-accent/15 text-foreground shadow-sm"
                      : "border-border/80 bg-muted/20 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  <span>{cat.label}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Affinities */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground block">
            Aesthetic Affinities
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLE_TAGS.map((tag) => {
              const selected = styleAffinities.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleStyle(tag)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    selected
                      ? "border-accent bg-accent text-accent-foreground shadow-sm"
                      : "border-border/80 bg-surface text-muted-foreground hover:border-accent/40 hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Freeform Collector Notes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-foreground block" htmlFor="taste-notes">
            Custom Styling & Collector Notes
          </label>
          <Input
            id="taste-notes"
            value={tasteNotes}
            onChange={(e) => setTasteNotes(e.target.value)}
            placeholder="e.g. In search of heavy morning coffee drippers and wood-fired tea bowls with raw clay finish..."
            className="text-xs"
          />
          <span className="text-[11px] text-muted-foreground block">
            Our AI embedding model translates these notes into high-dimensional semantic vectors to personalize recommendations.
          </span>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <Button type="submit" disabled={isSaving} className="text-xs font-medium gap-2">
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Re-indexing Vector Profile...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Save Taste Profile & Re-index AI</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
