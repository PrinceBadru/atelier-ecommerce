import Link from "next/link";
import { db } from "@/lib/db";
import { products, categories, productVariants } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Sparkles, Plus, Edit } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const allProducts = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    limit: 50,
    with: {
      category: true,
      variants: true,
    },
  });

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-accent font-medium">Workshop Goods</span>
            <h1 className="font-display text-scale-32 font-normal">Catalog Management</h1>
          </div>
          <Link href="/admin/products/new">
            <Button size="sm" className="text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-accent" /> Draft New with AI
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-surface shadow-elevation1 overflow-hidden">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                  <th className="p-4 font-medium">Product Title</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Variants & Stock</th>
                  <th className="p-4 font-medium">Vector Indexed</th>
                  <th className="p-4 font-medium text-right">Base Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {allProducts.map((prod) => {
                  const totalStock = prod.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
                  const hasVector = prod.embedding !== null;
                  return (
                    <tr key={prod.id} className="hover:bg-muted/15 transition-colors">
                      <td className="p-4 font-medium text-foreground">
                        <Link href={`/products/${prod.slug}`} className="hover:text-accent">
                          {prod.name}
                        </Link>
                      </td>
                      <td className="p-4 text-muted-foreground">{prod.category?.name || "Uncategorized"}</td>
                      <td className="p-4">
                        <Badge variant={prod.status === "active" ? "success" : "secondary"} className="text-[10px] capitalize">
                          {prod.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-foreground">
                        {prod.variants.length} variant(s) • {totalStock} in stock
                      </td>
                      <td className="p-4">
                        {hasVector ? (
                          <Badge variant="outline" className="text-[10px] border-accent/40 text-accent">
                            768-dim Vector
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </td>
                      <td className="p-4 text-right font-semibold text-foreground">
                        {formatPrice(prod.priceCents)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    );
}
