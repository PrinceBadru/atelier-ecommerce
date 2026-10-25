import { Metadata } from "next";
import { db } from "@/lib/db";
import { products, categories, productImages, productVariants } from "@/lib/db/schema";
import { eq, and, sql, asc, desc, inArray } from "drizzle-orm";
import { ProductCard } from "@/components/shop/ProductCard";
import { FilterBar } from "@/components/shop/FilterBar";
import { searchProducts } from "@/lib/ai/search";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "All Products — Atelier Considered Goods",
  description: "Browse our curated collection of ceramics, linen, cast iron, and expedition essentials.",
  openGraph: {
    title: "Atelier Catalog",
    description: "Considered goods for everyday living and honest journeys.",
  },
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    inStock?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams.category;
  const activeQuery = resolvedParams.q;
  const activeSort = resolvedParams.sort || "featured";
  const inStockOnly = resolvedParams.inStock === "true";
  const currentPage = parseInt(resolvedParams.page || "1", 10);
  const pageSize = 24;

  // 1. Fetch Categories for Filter Bar
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .orderBy(categories.name);

  // 2. Fetch Filtered Products
  let productItems: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    priceCents: number;
    currency: string;
    categoryName: string;
    imageUrl?: string;
    inStock: boolean;
    stockQuantity: number;
    matchReason?: string;
  }> = [];

  let totalCount = 0;

  if (activeQuery) {
    // Hybrid Semantic Search Pipeline
    const searchRes = await searchProducts(
      activeQuery,
      {
        categorySlug: activeCategory,
        inStockOnly,
      },
      pageSize
    );

    productItems = searchRes.items.map((item) => ({
      ...item,
      stockQuantity: item.inStock ? 12 : 0,
    }));
    totalCount = productItems.length;
  } else {
    // Relational Query with Dynamic Filters
    let queryBuilder = db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        priceCents: products.priceCents,
        currency: products.currency,
        categoryName: categories.name,
        categorySlug: categories.slug,
        imageUrl: productImages.url,
        stockQuantity: productVariants.stockQuantity,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productImages, eq(products.id, productImages.productId))
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(
        and(
          eq(products.status, "active"),
          activeCategory ? eq(categories.slug, activeCategory) : undefined
        )
      );

    // Sorting
    if (activeSort === "price-asc") {
      queryBuilder = queryBuilder.orderBy(asc(products.priceCents)) as any;
    } else if (activeSort === "price-desc") {
      queryBuilder = queryBuilder.orderBy(desc(products.priceCents)) as any;
    } else if (activeSort === "newest") {
      queryBuilder = queryBuilder.orderBy(desc(products.createdAt)) as any;
    } else {
      queryBuilder = queryBuilder.orderBy(asc(products.name)) as any;
    }

    const rows = await queryBuilder.limit(100);

    // Deduplicate joined rows
    const uniqueMap = new Map<string, (typeof rows)[0]>();
    for (const r of rows) {
      if (!uniqueMap.has(r.id)) {
        uniqueMap.set(r.id, r);
      }
    }

    const filtered = Array.from(uniqueMap.values()).filter((item) => {
      if (inStockOnly && (item.stockQuantity ?? 0) <= 0) return false;
      return true;
    });

    totalCount = filtered.length;
    productItems = filtered
      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
      .map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        priceCents: item.priceCents,
        currency: item.currency,
        categoryName: item.categoryName,
        imageUrl: item.imageUrl || undefined,
        inStock: (item.stockQuantity ?? 0) > 0,
        stockQuantity: item.stockQuantity ?? 0,
      }));
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-scale-24 font-normal tracking-tight">
            Atelier
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="outline" size="sm" className="text-xs">
                <ShoppingBag className="w-4 h-4 mr-1.5" /> Cart
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-accent uppercase tracking-wider mb-1 font-medium">
            <span>Mindful Catalog</span>
            <span>•</span>
            <span>100% Hand-Crafted Inventory</span>
          </div>
          <h1 className="font-display text-scale-32 sm:text-scale-48 font-normal tracking-tight">
            {activeCategory
              ? allCategories.find((c) => c.slug === activeCategory)?.name || "Collection"
              : "All Considered Goods"}
          </h1>
          <p className="text-muted-foreground text-scale-14 sm:text-scale-16 mt-1 max-w-2xl">
            Heirloom tableware, Belgian linen textiles, pre-seasoned cast iron, and durable waxed canvas.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <FilterBar categories={allCategories} totalResults={totalCount} />

        {/* Product Grid / Empty State */}
        {productItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface p-16 text-center max-w-md mx-auto my-12">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-display text-scale-20 font-medium mb-1">No products found</h3>
            <p className="text-scale-14 text-muted-foreground mb-6">
              No workshop items matched your current search or filters. Try adjusting your query or resetting filters.
            </p>
            <Link href="/products">
              <Button variant="secondary" size="sm">
                Reset All Filters
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productItems.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                description={product.description}
                priceCents={product.priceCents}
                currency={product.currency}
                categoryName={product.categoryName}
                imageUrl={product.imageUrl}
                inStock={product.inStock}
                stockQuantity={product.stockQuantity}
                matchReason={product.matchReason}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-border">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/products?${new URLSearchParams({
                  ...(activeCategory ? { category: activeCategory } : {}),
                  ...(activeQuery ? { q: activeQuery } : {}),
                  ...(activeSort ? { sort: activeSort } : {}),
                  page: String(pageNum),
                }).toString()}`}
              >
                <Button
                  size="sm"
                  variant={pageNum === currentPage ? "default" : "outline"}
                  className="w-9 h-9 p-0 text-xs"
                >
                  {pageNum}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
