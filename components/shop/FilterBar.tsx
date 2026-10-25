"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface FilterBarProps {
  categories: CategoryOption[];
  totalResults: number;
}

export function FilterBar({ categories, totalResults }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active query parameters
  const activeCategory = searchParams.get("category") || "";
  const activeQuery = searchParams.get("q") || "";
  const activeSort = searchParams.get("sort") || "featured";
  const inStockOnly = searchParams.get("inStock") === "true";
  const maxPrice = searchParams.get("maxPrice") || "";

  const [searchInput, setSearchInput] = React.useState(activeQuery);

  // Sync state if URL changes externally (back/forward navigation)
  React.useEffect(() => {
    setSearchInput(activeQuery);
  }, [activeQuery]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    // Reset to page 1 on filter changes
    params.delete("page");

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || (key === "inStock" && val === "false")) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const hasActiveFilters = Boolean(
    activeCategory || activeQuery || inStockOnly || maxPrice
  );

  return (
    <div className="space-y-4 mb-8">
      {/* Top Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar with Debounce/Submit */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search stoneware, linen, beeswax, cast iron..."
            className="pl-9 pr-8 h-10 bg-surface shadow-elevation1 focus-visible:border-accent"
          />
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground pointer-events-none" />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateFilters({ q: null });
              }}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Sort & In-Stock Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => updateFilters({ inStock: e.target.checked ? "true" : "false" })}
              className="rounded border-border text-primary focus:ring-ring w-4 h-4"
            />
            <span>In Stock Only</span>
          </label>

          <div className="relative">
            <select
              value={activeSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="h-10 text-xs font-medium bg-surface border border-border rounded-md px-3 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Button
          size="sm"
          variant={activeCategory === "" ? "default" : "outline"}
          onClick={() => updateFilters({ category: null })}
          className="rounded-full text-xs shrink-0"
        >
          All Goods ({totalResults})
        </Button>
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.slug;
          return (
            <Button
              key={cat.id}
              size="sm"
              variant={isSelected ? "default" : "outline"}
              onClick={() => updateFilters({ category: isSelected ? null : cat.slug })}
              className="rounded-full text-xs shrink-0 whitespace-nowrap"
            >
              {cat.name}
            </Button>
          );
        })}
      </div>

      {/* Active Filter Chips & Clear Button */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs">
          <span className="text-muted-foreground">Active Filters:</span>
          {activeCategory && (
            <Badge variant="secondary" className="flex items-center gap-1 pl-2.5 pr-1.5 py-1">
              Category: {categories.find((c) => c.slug === activeCategory)?.name || activeCategory}
              <button onClick={() => updateFilters({ category: null })} className="hover:text-foreground">
                <X className="w-3 h-3 ml-1" />
              </button>
            </Badge>
          )}
          {activeQuery && (
            <Badge variant="secondary" className="flex items-center gap-1 pl-2.5 pr-1.5 py-1">
              Query: &ldquo;{activeQuery}&rdquo;
              <button onClick={() => updateFilters({ q: null })} className="hover:text-foreground">
                <X className="w-3 h-3 ml-1" />
              </button>
            </Badge>
          )}
          {inStockOnly && (
            <Badge variant="secondary" className="flex items-center gap-1 pl-2.5 pr-1.5 py-1">
              In Stock Only
              <button onClick={() => updateFilters({ inStock: "false" })} className="hover:text-foreground">
                <X className="w-3 h-3 ml-1" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
          >
            Reset All
          </Button>
        </div>
      )}
    </div>
  );
}
