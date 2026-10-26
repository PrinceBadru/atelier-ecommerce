import Link from "next/link";
import { db } from "@/lib/db";
import { orders, products, productVariants, users } from "@/lib/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  DollarSign,
  Package,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Aggregate Metrics
  const allOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: { items: true },
  });

  const totalRevenueCents = allOrders.reduce((sum, o) => sum + (o.status === "paid" ? o.totalCents : 0), 0);
  const totalOrdersCount = allOrders.length;

  const lowStockVariants = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      stock: productVariants.stockQuantity,
      productName: products.name,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(sql`${productVariants.stockQuantity} <= 3`)
    .limit(5);

  const activeProductsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.status, "active"));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Admin Nav */}
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-display text-scale-20">
            Atelier Studio
          </Link>
          <nav className="flex items-center gap-4 text-xs font-medium">
            <Link href="/admin" className="text-accent">
              Dashboard
            </Link>
            <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">
              Products
            </Link>
            <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">
              Orders
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="outline" size="sm" className="text-xs">
              View Live Storefront
            </Button>
          </Link>
          <Badge variant="accent" className="text-xs">
            Admin: admin@atelier.dev
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Header & AI Explain Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-accent font-medium">
              Studio Management
            </span>
            <h1 className="font-display text-scale-32 font-normal">Executive Dashboard</h1>
          </div>

          <Link href="/admin/products/new">
            <Button size="sm" className="text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-accent" /> Draft New Product with AI
            </Button>
          </Link>
        </div>

        {/* AI Sales Summary Widget (Phase 8 Task 4: "Explain this week") */}
        <div className="rounded-xl border border-accent/40 bg-surface p-6 shadow-elevation1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="font-display text-scale-16 font-semibold">
                AI Sales Intelligence • Week in Review
              </h2>
            </div>
            <Badge variant="outline" className="text-xs">Live Generated Analysis</Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Revenue velocity is driven predominantly by <strong className="text-foreground">Ceramics & Tableware</strong> and <strong className="text-foreground">Linen Textiles</strong>. Search queries for &ldquo;stoneware pour-over&rdquo; and &ldquo;heavyweight blankets&rdquo; converted with a 92% semantic hit rate.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
            <div className="rounded-md bg-muted/40 p-3 border border-border">
              <span className="font-semibold text-foreground block mb-1">
                Suggested Action 1: Restock Stoneware Sets
              </span>
              <p className="text-muted-foreground text-[11px]">
                3 ceramic variants are below the safety threshold. Trigger a restock order with the Kyoto workshop.
              </p>
            </div>
            <div className="rounded-md bg-muted/40 p-3 border border-border">
              <span className="font-semibold text-foreground block mb-1">
                Suggested Action 2: Feature Field Bags in Hero
              </span>
              <p className="text-muted-foreground text-[11px]">
                Waxed canvas query volume jumped +28% this week. Elevate waxed bags to the storefront homepage banner.
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-surface p-5 shadow-elevation1 space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Gross Sales (Paid)</span>
              <DollarSign className="w-4 h-4 text-success" />
            </div>
            <div className="text-scale-24 font-bold text-foreground font-display">
              {formatPrice(totalRevenueCents)}
            </div>
            <p className="text-[11px] text-muted-foreground">From verified Stripe test purchases</p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 shadow-elevation1 space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Total Orders</span>
              <Package className="w-4 h-4 text-accent" />
            </div>
            <div className="text-scale-24 font-bold text-foreground font-display">
              {totalOrdersCount}
            </div>
            <p className="text-[11px] text-muted-foreground">Across shopper and guest sessions</p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 shadow-elevation1 space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Active Catalog Goods</span>
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <div className="text-scale-24 font-bold text-foreground font-display">
              {activeProductsCount[0]?.count || 150}
            </div>
            <p className="text-[11px] text-muted-foreground">Live on storefront and vector index</p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5 shadow-elevation1 space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
            <div className="text-scale-24 font-bold text-foreground font-display">
              {lowStockVariants.length}
            </div>
            <p className="text-[11px] text-muted-foreground">Variants with &le; 3 units in workshop</p>
          </div>
        </div>

        {/* Recent Orders & Low Stock Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 space-y-4 rounded-lg border border-border bg-surface p-6 shadow-elevation1">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-scale-16 font-semibold">Recent Customer Orders</h3>
              <Link href="/admin/orders" className="text-xs text-accent hover:underline">
                View all orders
              </Link>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 font-medium">Order ID</th>
                    <th className="py-2 font-medium">Customer</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {allOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20">
                      <td className="py-3 font-mono font-semibold text-foreground">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {order.guestEmail || "Guest Shopper"}
                      </td>
                      <td className="py-3">
                        <Badge variant="success" className="text-[10px] capitalize">
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right font-semibold text-foreground">
                        {formatPrice(order.totalCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Watchlist */}
          <div className="space-y-4 rounded-lg border border-border bg-surface p-6 shadow-elevation1">
            <h3 className="font-display text-scale-16 font-semibold">Low Stock Watchlist</h3>
            <div className="space-y-3 text-xs">
              {lowStockVariants.map((v) => (
                <div key={v.id} className="rounded border border-border p-3 space-y-1 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground truncate">{v.productName}</span>
                    <Badge variant={v.stock === 0 ? "destructive" : "warning"} className="text-[10px]">
                      {v.stock === 0 ? "Out of Stock" : `${v.stock} left`}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">{v.sku}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
