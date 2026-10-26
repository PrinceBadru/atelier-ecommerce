import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  ShoppingBag,
  User,
  HeartHandshake,
  Recycle,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs tracking-wider uppercase font-medium">
        Complimentary worldwide shipping on orders over $150 • Handcrafted in Verified Artisan Workshops
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-display text-scale-24 font-normal tracking-tight hover:opacity-85 transition-opacity">
              Atelier
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-xs text-muted-foreground">
              <Link href="/products" className="hover:text-foreground transition-colors">
                All Goods
              </Link>
              <Link href="/products?category=ceramics-tableware" className="hover:text-foreground transition-colors">
                Ceramics & Living
              </Link>
              <Link href="/products?category=linen-textiles" className="hover:text-foreground transition-colors">
                Linen & Textiles
              </Link>
              <Link href="/products?category=cast-iron-cookware" className="hover:text-foreground transition-colors">
                Cookware
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/account">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Account</span>
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bag</span>
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
        <section className="relative overflow-hidden py-24 sm:py-32 border-b border-border bg-gradient-to-b from-surface via-background to-background">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs text-muted-foreground shadow-elevation1">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Autumn 2026 Collection • Curated Artisan Editions</span>
            </div>

            <h1 className="font-display text-scale-48 sm:text-scale-64 font-normal tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
              Considered goods for everyday living and honest journeys.
            </h1>

            <p className="text-muted-foreground text-scale-16 sm:text-scale-20 max-w-2xl mx-auto font-sans leading-relaxed">
              Atelier pairs heirloom craftsmanship with mindful studio curation. Discover hand-thrown stoneware, Belgian linen, and hand-forged cookware built to endure for generations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto text-scale-16 px-8 shadow-elevation2">
                  Browse Catalog
                </Button>
              </Link>
              <Link href="/products?category=ceramics-tableware">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-scale-16 px-8">
                  Ceramics & Tableware
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Curated Categories Grid */}
        <section className="py-20 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-accent font-medium">Workshop Collections</span>
                <h2 className="font-display text-scale-32 font-normal mt-1">Curated Disciplines</h2>
              </div>
              <Link href="/products" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                View all categories <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Ceramics & Tableware",
                  desc: "Wood-fired stoneware and glazed vessels crafted by Kyoto and Mino artisans.",
                  href: "/products?category=ceramics-tableware",
                  badge: "40+ Objects",
                },
                {
                  title: "Linen & Textiles",
                  desc: "Oeko-Tex certified Belgian flax spun for bedroom sanctuary and dining table.",
                  href: "/products?category=linen-textiles",
                  badge: "35+ Objects",
                },
                {
                  title: "Cast Iron & Cookware",
                  desc: "Pre-seasoned sand-cast dutch ovens and carbon steel skillets for open fire and hearth.",
                  href: "/products?category=cast-iron-cookware",
                  badge: "35+ Objects",
                },
                {
                  title: "Waxed Canvas & Bags",
                  desc: "Heavyweight weather-resistant field bags and haversacks engineered for the journey.",
                  href: "/products?category=waxed-canvas-bags",
                  badge: "40+ Objects",
                },
              ].map((category) => (
                <Link
                  key={category.title}
                  href={category.href}
                  className="group relative rounded-xl border border-border bg-surface p-6 shadow-elevation1 hover:border-accent/50 transition-all hover:shadow-elevation2 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono text-accent">{category.badge}</span>
                    <h3 className="font-display text-scale-20 font-medium group-hover:text-accent transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {category.desc}
                    </p>
                  </div>
                  <div className="pt-6 flex items-center text-xs font-medium text-foreground group-hover:text-accent transition-colors">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display text-scale-20 font-medium">Authentic Provenance</h3>
              <p className="text-scale-14 text-muted-foreground leading-relaxed">
                Small-batch stoneware, forged ironware, and organic linen sourced directly from verified independent workshops worldwide.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-display text-scale-20 font-medium">Intelligent Studio Curation</h3>
              <p className="text-scale-14 text-muted-foreground leading-relaxed">
                Ask our interactive styling curator for personalized pairings, material care guidance, and tabletop composition recommendations.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Recycle className="w-5 h-5" />
              </div>
              <h3 className="font-display text-scale-20 font-medium">Enduring Stewardship</h3>
              <p className="text-scale-14 text-muted-foreground leading-relaxed">
                Goods designed to patina and improve with age, supported by plastic-free recyclable packaging and lifetime workshop repairs.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-border">
            <div className="space-y-3 md:col-span-1">
              <h4 className="font-display text-scale-20 font-normal">Atelier</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Mindful home and outdoor goods crafted with honest materials and enduring purpose.
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">Catalog</h5>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/products" className="hover:text-foreground transition-colors">All Objects</Link></li>
                <li><Link href="/products?category=ceramics-tableware" className="hover:text-foreground transition-colors">Tableware & Ceramics</Link></li>
                <li><Link href="/products?category=linen-textiles" className="hover:text-foreground transition-colors">Textiles & Linen</Link></li>
                <li><Link href="/products?category=cast-iron-cookware" className="hover:text-foreground transition-colors">Cast Iron & Hearth</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">Customer Care</h5>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/account" className="hover:text-foreground transition-colors">Order Tracking & History</Link></li>
                <li><Link href="/cart" className="hover:text-foreground transition-colors">Shopping Bag</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In to Account</Link></li>
                <li><Link href="/register" className="hover:text-foreground transition-colors">Join Atelier</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">Studio Access</h5>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/admin/login" className="hover:text-accent transition-colors">Studio Admin Portal</Link></li>
                <li><span className="text-muted-foreground/80">Kyoto • Portland • Ghent</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Atelier Studio. All rights reserved.</p>
            <p className="text-[11px] text-muted-foreground/80">Ethically crafted goods with verified artisan provenance.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
