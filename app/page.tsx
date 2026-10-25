import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Compass, SlidersHorizontal } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs tracking-wider uppercase font-medium">
        Complimentary worldwide shipping on orders over $150 • Grounded AI Shopping Experience
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-display text-scale-24 font-normal tracking-tight">
              Atelier
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/products" className="hover:text-foreground transition-colors">
                All Products
              </Link>
              <Link href="/products?category=home" className="hover:text-foreground transition-colors">
                Home Goods
              </Link>
              <Link href="/products?category=outdoor" className="hover:text-foreground transition-colors">
                Outdoor Gear
              </Link>
              <Link href="/design-system" className="hover:text-foreground transition-colors flex items-center gap-1 text-accent font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Design System
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/design-system">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs">
                View Design System
              </Button>
            </Link>
            <Link href="/products">
              <Button size="sm" className="text-xs">
                Explore Catalog <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 sm:py-32 border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs text-muted-foreground shadow-elevation1">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Grounded AI shopping assistant & hybrid semantic search</span>
            </div>

            <h1 className="font-display text-scale-48 sm:text-scale-64 font-normal tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Considered goods for everyday living and honest journeys.
            </h1>

            <p className="text-muted-foreground text-scale-16 sm:text-scale-20 max-w-2xl mx-auto font-sans leading-relaxed">
              Atelier pairs heirloom craftsmanship with measured artificial intelligence. Discover stoneware, waxed canvas, and cast iron built to endure.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto text-scale-16 px-8 shadow-elevation2">
                  Browse Catalog
                </Button>
              </Link>
              <Link href="/design-system">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-scale-16 px-8">
                  Inspect Tokens & Specs
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-16 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display text-scale-20 font-medium">Authentic Craft</h3>
              <p className="text-scale-14 text-muted-foreground">
                Small-batch stoneware, forged ironware, and organic linen sourced directly from verified workshops.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-accent">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-display text-scale-20 font-medium">Grounded AI Assistance</h3>
              <p className="text-scale-14 text-muted-foreground">
                Natural-language hybrid search and conversational recommendations strictly grounded in verified inventory.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-success">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-display text-scale-20 font-medium">Tactile Polish</h3>
              <p className="text-scale-14 text-muted-foreground">
                Full-stack Next.js 15, Drizzle ORM with pgvector, Stripe checkout, Better Auth, and strict WCAG 2.2 AA accessibility.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Atelier Studio. Designed & engineered for high fidelity demo.</p>
          <div className="flex gap-6">
            <Link href="/design-system" className="hover:text-foreground transition-colors">
              Design System
            </Link>
            <Link href="/products" className="hover:text-foreground transition-colors">
              Storefront
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
