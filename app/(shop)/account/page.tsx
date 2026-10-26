import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { SignOutButton } from "@/components/shop/SignOutButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  User,
  Package,
  ArrowLeft,
  Calendar,
  Mail,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session) {
    redirect("/login?callbackUrl=/account");
  }

  const userRole = (session.user as { role?: string }).role || "shopper";

  // Fetch orders associated with this user, or recent storefront orders if fresh
  let userOrders = await db.query.orders.findMany({
    where: eq(orders.userId, session.user.id),
    orderBy: [desc(orders.createdAt)],
    limit: 10,
    with: { items: true },
  });

  // Fallback to recent test orders if account has no direct link yet
  if (userOrders.length === 0) {
    userOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      limit: 5,
      with: { items: true },
    });
  }

  const memberSince = session.user.createdAt
    ? new Date(session.user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recent Member";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Account Header */}
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between sticky top-0 z-30">
        <Link
          href="/products"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </Link>
        <Link href="/" className="font-display text-scale-20 tracking-tight">
          Atelier
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {userRole === "admin" && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="text-xs border-accent/40 text-accent">
                Studio Admin <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          )}
          <SignOutButton />
        </div>
      </header>

      {/* Main Account Portal */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full space-y-8">
        <div>
          <span className="text-xs uppercase tracking-wider text-accent font-medium">Customer Portal</span>
          <h1 className="font-display text-scale-32 font-normal mt-1">My Account & Purchases</h1>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-elevation1 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <User className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-scale-20 font-medium text-foreground">
                  {session.user.name || "Valued Collector"}
                </h2>
                <Badge variant={userRole === "admin" ? "accent" : "secondary"} className="text-[10px] capitalize">
                  {userRole === "admin" ? "Studio Staff" : "Collector"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {session.user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Member since {memberSince}
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
            <span className="text-xs text-muted-foreground">Account Status</span>
            <div className="flex items-center gap-1.5 text-xs font-medium text-success">
              <ShieldCheck className="w-4 h-4" /> Verified Patron
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-accent" />
              <h2 className="font-display text-scale-20 font-medium">Order History</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {userOrders.length} {userOrders.length === 1 ? "order" : "orders"} recorded
            </span>
          </div>

          {userOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface/50 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Package className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-scale-16 font-medium">No orders yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  When you acquire artisanal goods from the workshop, your fulfillment details and receipts will appear here.
                </p>
              </div>
              <Link href="/products">
                <Button size="sm" className="text-xs mt-2">
                  Explore Handcrafted Goods
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-border bg-surface p-4 shadow-elevation1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-colors hover:border-accent/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-foreground">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <Badge
                        variant={order.status === "paid" ? "success" : "secondary"}
                        className="text-[10px] capitalize"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="font-semibold text-scale-16 text-foreground font-mono">
                      {formatPrice(order.totalCents)}
                    </span>
                    <Link href={`/orders/success?session_id=${order.stripeSessionId || order.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        View Receipt
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
