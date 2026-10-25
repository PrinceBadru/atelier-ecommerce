import Link from "next/link";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from "lucide-react";

export default async function AdminOrdersPage() {
  const allOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: { items: true },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="font-display text-scale-20">Atelier Studio Admin</span>
        <div className="w-16" />
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-wider text-accent font-medium">Fulfillment</span>
            <h1 className="font-display text-scale-32 font-normal">Customer Orders ({allOrders.length})</h1>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface shadow-elevation1 overflow-hidden">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                  <th className="p-4 font-medium">Order Number</th>
                  <th className="p-4 font-medium">Customer Email</th>
                  <th className="p-4 font-medium">Date Placed</th>
                  <th className="p-4 font-medium">Items Count</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {allOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/15 transition-colors">
                    <td className="p-4 font-mono font-semibold text-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {order.guestEmail || "guest@atelier.dev"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-foreground font-medium">
                      {order.items.length} items
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          order.status === "paid" || order.status === "fulfilled"
                            ? "success"
                            : order.status === "pending"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-[10px] capitalize"
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-semibold text-foreground">
                      {formatPrice(order.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
