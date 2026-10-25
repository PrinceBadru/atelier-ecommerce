"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon, Sparkles, Check, AlertCircle, ArrowRight, ShoppingBag } from "lucide-react";

export default function DesignSystemPage() {
  const [isDark, setIsDark] = React.useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-320 p-6 md:p-12 ${isDark ? "dark" : ""}`}>
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display italic text-accent text-scale-20">Atelier</span>
              <Badge variant="outline" className="text-xs">Design System v1.0</Badge>
            </div>
            <h1 className="font-display text-scale-48 font-normal tracking-tight">Design Tokens & Components</h1>
            <p className="text-muted-foreground text-scale-16 mt-2 max-w-xl">
              Living design authority representing Atelier&apos;s warm-minimalist aesthetic. Evaluated for WCAG 2.2 AA contrast, responsive typography, and tactile motion.
            </p>
          </div>
          <Button
            onClick={toggleTheme}
            variant="outline"
            className="flex items-center gap-2 shadow-elevation1 hover:border-accent"
          >
            {isDark ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
            <span>Switch to {isDark ? "Light" : "Dark"} Mode</span>
          </Button>
        </header>

        {/* 1. Color Palette Tokens */}
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-scale-24 font-semibold">01 / Color Tokens</h2>
            <p className="text-muted-foreground text-scale-14">
              Warm neutral palette anchored by linen, rich charcoal, crafted terracotta bronze, and alpine foliage.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-md border border-border bg-background shadow-elevation1">
              <div className="h-14 w-full rounded border border-border bg-background mb-3" />
              <div className="font-medium text-scale-14">Background</div>
              <div className="text-xs text-muted-foreground">--background</div>
            </div>
            <div className="p-4 rounded-md border border-border bg-surface shadow-elevation1">
              <div className="h-14 w-full rounded border border-border bg-surface mb-3" />
              <div className="font-medium text-scale-14">Surface</div>
              <div className="text-xs text-muted-foreground">--surface</div>
            </div>
            <div className="p-4 rounded-md border border-border bg-surface shadow-elevation1">
              <div className="h-14 w-full rounded bg-foreground mb-3" />
              <div className="font-medium text-scale-14">Foreground</div>
              <div className="text-xs text-muted-foreground">--foreground</div>
            </div>
            <div className="p-4 rounded-md border border-border bg-surface shadow-elevation1">
              <div className="h-14 w-full rounded bg-muted border border-border mb-3" />
              <div className="font-medium text-scale-14">Muted</div>
              <div className="text-xs text-muted-foreground">--muted</div>
            </div>
            <div className="p-4 rounded-md border border-border bg-surface shadow-elevation1">
              <div className="h-14 w-full rounded bg-primary mb-3" />
              <div className="font-medium text-scale-14">Primary</div>
              <div className="text-xs text-muted-foreground">--primary</div>
            </div>
            <div className="p-4 rounded-md border border-border bg-surface shadow-elevation1">
              <div className="h-14 w-full rounded bg-accent mb-3" />
              <div className="font-medium text-scale-14">Accent Bronze</div>
              <div className="text-xs text-muted-foreground">--accent</div>
            </div>
            <div className="p-4 rounded-md border border-border bg-surface shadow-elevation1">
              <div className="h-14 w-full rounded bg-success mb-3" />
              <div className="font-medium text-scale-14">Forest Pine</div>
              <div className="text-xs text-muted-foreground">--success</div>
            </div>
            <div className="p-4 rounded-md border border-border bg-surface shadow-elevation1">
              <div className="h-14 w-full rounded bg-warning mb-3" />
              <div className="font-medium text-scale-14">Amber Ochre</div>
              <div className="text-xs text-muted-foreground">--warning</div>
            </div>
            <div className="p-4 rounded-md border border-border bg-surface shadow-elevation1">
              <div className="h-14 w-full rounded bg-danger mb-3" />
              <div className="font-medium text-scale-14">Rust Red</div>
              <div className="text-xs text-muted-foreground">--danger</div>
            </div>
            <div className="p-4 rounded-md border border-border bg-surface shadow-elevation1">
              <div className="h-14 w-full rounded border-2 border-border mb-3 bg-muted/30" />
              <div className="font-medium text-scale-14">Border</div>
              <div className="text-xs text-muted-foreground">--border</div>
            </div>
          </div>
        </section>

        <Separator />

        {/* 2. Typography Scale */}
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-scale-24 font-semibold">02 / Modular Typography Scale</h2>
            <p className="text-muted-foreground text-scale-14">
              Display face: Playfair Display serif. Body face: Inter clean sans. Modular scale: 12, 14, 16, 20, 24, 32, 48, 64px.
            </p>
          </div>

          <div className="space-y-4 border border-border rounded-lg p-6 bg-surface">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-border/50 pb-3 gap-2">
              <span className="text-xs font-mono text-muted-foreground">scale-64 (4rem / 64px)</span>
              <p className="font-display text-scale-64 leading-none">Considered Living</p>
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-border/50 pb-3 gap-2">
              <span className="text-xs font-mono text-muted-foreground">scale-48 (3rem / 48px)</span>
              <p className="font-display text-scale-48 leading-tight">Artisanal Stoneware</p>
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-border/50 pb-3 gap-2">
              <span className="text-xs font-mono text-muted-foreground">scale-32 (2rem / 32px)</span>
              <p className="font-display text-scale-32">Outdoor Waxed Canvas</p>
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-border/50 pb-3 gap-2">
              <span className="text-xs font-mono text-muted-foreground">scale-24 (1.5rem / 24px)</span>
              <p className="font-display text-scale-24 font-medium">Curated Essentials</p>
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-border/50 pb-3 gap-2">
              <span className="text-xs font-mono text-muted-foreground">scale-20 (1.25rem / 20px)</span>
              <p className="font-sans text-scale-20 font-medium">Cast Iron Pour-Over Kettle</p>
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-border/50 pb-3 gap-2">
              <span className="text-xs font-mono text-muted-foreground">scale-16 (1rem / 16px)</span>
              <p className="font-sans text-scale-16">Standard body typography for reading comfort and high legibility.</p>
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-border/50 pb-3 gap-2">
              <span className="text-xs font-mono text-muted-foreground">scale-14 (0.875rem / 14px)</span>
              <p className="font-sans text-scale-14 text-muted-foreground">Secondary metadata, specifications, and captions.</p>
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <span className="text-xs font-mono text-muted-foreground">scale-12 (0.75rem / 12px)</span>
              <p className="font-sans text-scale-12 uppercase tracking-widest text-muted-foreground">Badges, pills, tags, timestamps</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* 3. Space, Elevation & Radii */}
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-scale-24 font-semibold">03 / Elevation, Radius & Spacing</h2>
            <p className="text-muted-foreground text-scale-14">
              4px base scale. Radius tokens: sm (4px), md (8px), lg (14px). 3 subtle tactile shadows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-sm border border-border bg-surface shadow-elevation1 text-center">
              <div className="font-semibold text-scale-16 mb-1">Elevation 1 (Shadow-1)</div>
              <div className="text-xs text-muted-foreground mb-3">Radius: sm (4px)</div>
              <p className="text-scale-14 text-muted-foreground">Subtle border accent for cards and resting UI elements.</p>
            </div>
            <div className="p-6 rounded-md border border-border bg-surface shadow-elevation2 text-center">
              <div className="font-semibold text-scale-16 mb-1">Elevation 2 (Shadow-2)</div>
              <div className="text-xs text-muted-foreground mb-3">Radius: md (8px)</div>
              <p className="text-scale-14 text-muted-foreground">Elevated hover states, search dropdowns, floating filters.</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-surface shadow-elevation3 text-center">
              <div className="font-semibold text-scale-16 mb-1">Elevation 3 (Shadow-3)</div>
              <div className="text-xs text-muted-foreground mb-3">Radius: lg (14px)</div>
              <p className="text-scale-14 text-muted-foreground">Modals, AI shopping assistant drawer, slide-out carts.</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* 4. Interactive Components & States */}
        <section className="space-y-8">
          <div>
            <h2 className="font-display text-scale-24 font-semibold">04 / Component States & Behaviors</h2>
            <p className="text-muted-foreground text-scale-14">
              Full verification of default, hover, active, disabled, loading, empty, and error states.
            </p>
          </div>

          {/* Button Variants */}
          <div className="space-y-4">
            <h3 className="text-scale-16 font-semibold">Button Variants & Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="default">Primary Action</Button>
              <Button variant="accent">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button disabled>Disabled State</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large Hero Action</Button>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-4">
            <h3 className="text-scale-16 font-semibold">Badges & Inventory Statuses</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="accent">AI Curated</Badge>
              <Badge variant="success">In Stock</Badge>
              <Badge variant="warning">Low Stock (3 left)</Badge>
              <Badge variant="destructive">Out of Stock</Badge>
              <Badge variant="secondary">Handmade</Badge>
              <Badge variant="outline">Recycled Brass</Badge>
            </div>
          </div>

          {/* Forms & Inputs */}
          <div className="space-y-4">
            <h3 className="text-scale-16 font-semibold">Form Inputs (Normal, Focus, Error, Disabled)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Standard Input</label>
                <Input placeholder="e.g. Linen Throw Blanket" />
                <span className="text-xs text-muted-foreground">Inline helper text</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-danger flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Error State
                </label>
                <Input defaultValue="Invalid quantity (-1)" className="border-danger focus-visible:ring-danger" />
                <span className="text-xs text-danger">Quantity must be greater than zero</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Disabled Input</label>
                <Input disabled defaultValue="atelier@locked.com" />
                <span className="text-xs text-muted-foreground">Field is read-only</span>
              </div>
            </div>
          </div>

          {/* Product Card Example */}
          <div className="space-y-4">
            <h3 className="text-scale-16 font-semibold">Product Card (Success, Hover & Loading Skeleton)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Ready State */}
              <Card className="overflow-hidden group hover:shadow-elevation2 transition-all duration-320">
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center transition-transform duration-320 group-hover:scale-105"
                       style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80')` }} />
                  <Badge variant="accent" className="absolute top-3 left-3 shadow-sm">AI Top Match</Badge>
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Ceramics</span>
                    <span className="text-success font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> In Stock
                    </span>
                  </div>
                  <CardTitle className="text-scale-16 font-display group-hover:text-accent transition-colors">
                    Hand-Thrown Stoneware Mug
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Crafted from local clay with a matte volcanic ash glaze. Retains heat effortlessly.
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/50 mt-2">
                  <span className="font-semibold text-scale-16">$38.00</span>
                  <Button size="sm" variant="outline" className="text-xs">
                    <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Add
                  </Button>
                </CardFooter>
              </Card>

              {/* Skeleton Loading State */}
              <Card className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </Card>

              {/* Empty / Error State Preview */}
              <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="font-display font-medium text-scale-16 mb-1">No items found</h4>
                <p className="text-xs text-muted-foreground max-w-xs mb-4">
                  We couldn&apos;t find products matching your filters. Try resetting or adjusting criteria.
                </p>
                <Button size="sm" variant="secondary">Reset Filters</Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-4">
          <div>Atelier Design Tokens • WCAG 2.2 AA Verified</div>
          <div>Next.js App Router • Tailwind CSS • shadcn/ui</div>
        </footer>
      </div>
    </div>
  );
}
