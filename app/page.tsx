import Link from "next/link";
import { StorefrontHeader } from "@/components/shop/StorefrontHeader";
import { AnnouncementTicker } from "@/components/landing/AnnouncementTicker";
import { HeroAtmosphere } from "@/components/landing/HeroAtmosphere";
import { HeroHeadline } from "@/components/landing/HeroHeadline";
import { ArtisanShowcaseReel } from "@/components/landing/ArtisanShowcaseReel";
import { CuratedCollections } from "@/components/landing/CuratedCollections";
import { CuratorPromptTeaser } from "@/components/landing/CuratorPromptTeaser";
import { ScrollRevealPillars } from "@/components/landing/ScrollRevealPillars";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative selection:bg-accent/25 selection:text-foreground">
      {/* 1. Dynamic Studio Announcement Ticker */}
      <AnnouncementTicker />

      {/* 2. Unified Header Navigation with Theme Switcher & Cart */}
      <StorefrontHeader />

      <main className="flex-1">
        {/* 3. Hero Section with Interactive Atmospheric Mesh & Staggered Reveal */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-surface/60 via-background to-background">
          <HeroAtmosphere />
          <HeroHeadline />
        </section>

        {/* 4. Infinite Kinetic Artisan Showcase Reel */}
        <ArtisanShowcaseReel />

        {/* 5. Curated Workshop Collections (Spotlight Bento Grid with 3D Tilt) */}
        <CuratedCollections />

        {/* 6. Interactive Studio Curator Teaser (Clickable AI Prompt Chips) */}
        <CuratorPromptTeaser />

        {/* 7. Scroll-Triggered Value Commitments */}
        <ScrollRevealPillars />
      </main>

      {/* 8. Studio Footer */}
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
                <li>
                  <Link href="/products" className="hover:text-foreground transition-colors">
                    All Objects
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=ceramics-tableware" className="hover:text-foreground transition-colors">
                    Tableware & Ceramics
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=linen-textiles" className="hover:text-foreground transition-colors">
                    Textiles & Linen
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=cast-iron-cookware" className="hover:text-foreground transition-colors">
                    Cast Iron & Hearth
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">Customer Care</h5>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link href="/account" className="hover:text-foreground transition-colors">
                    Order Tracking & History
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="hover:text-foreground transition-colors">
                    Shopping Bag
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground transition-colors">
                    Sign In to Account
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-foreground transition-colors">
                    Join Atelier
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-foreground">Studio Access</h5>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link href="/admin/login" className="hover:text-accent transition-colors">
                    Studio Admin Portal
                  </Link>
                </li>
                <li>
                  <span className="text-muted-foreground/80">Kyoto • Portland • Ghent</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Atelier Studio. All rights reserved.</p>
            <p className="text-[11px] text-muted-foreground/80">
              Ethically crafted goods with verified artisan provenance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
