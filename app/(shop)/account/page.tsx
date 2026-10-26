import Link from "next/link";
import { db } from "@/lib/db";
import { orders, orderItems, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { User, Package, ShieldAlert, ArrowRight, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const recentOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    limit: 5,
    with: { items: true },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between">
        <Link href="/products" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </Link>
        <Link href="/" className="font-display text-scale-20">
          Atelier
        </Link>
        <Link href="/admin">
          <Button variant="outline" size="sm" className="text-xs">
            Admin Portal
          </Button>
        </Link>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full space-y-10">
        <div>
          <span className="text-xs uppercase tracking-wider text-accent font-medium">Customer Portal</span>
          <h1 className="font-display text-scale-32 font-normal mt-1">Account & Workshop Orders</h1>
        </div>

        {/* Demo Account Switcher Card */}
        <div className="rounded-xl border border-accent/40 bg-surface p-6 shadow-elevation1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-scale-16 font-semibold">Demo Accounts</h3>
                <p className="text-xs text-muted-foreground">Quickly test both Shopper and Admin personas.</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">Active Session: Shopper</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-foreground">Shopper Persona</span>
                <Badge variant="secondary" className="text-[10px]">Shopper</Badge>
              </div>
              <p className="font-mono text-xs text-muted-foreground">demo@atelier.dev</p>
              <p className="text-[11px] text-muted-foreground">Browses, adds to cart, chats with AI assistant, checks out.</p>
            </div>

            <div className="rounded-lg border border-accent/50 p-4 bg-accent/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-foreground">Admin Persona</span>
                <Badge variant="accent" className="text-[10px]">Admin Access</Badge>
              </div>
              <p className="font-mono text-xs text-muted-foreground">admin@atelier.dev</p>
              <p className="text-[11px] text-muted-foreground">Manages catalog, edits copy with AI, views sales intelligence.</p>
              <Link href="/admin" className="block pt-1">
                <Button size="sm" variant="accent" className="w-full text-xs">
                  Enter Admin Studio <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="space-y-4">
          <h2 className="font-display text-scale-20 font-medium">Recent Purchases</h2>

          {recentOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-xs">
              No orders placed yet. Add items to your cart and complete a test purchase.
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-border bg-surface p-4 shadow-elevation1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <Badge variant="success" className="text-[10px] capitalize">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="font-semibold text-scale-16 text-foreground">
                      {formatPrice(order.totalCents)}
                    </span>
                    <Link href={`/orders/success?session_id=${order.stripeSessionId || order.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Receipt
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
