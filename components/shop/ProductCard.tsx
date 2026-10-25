"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Check, AlertTriangle, Sparkles } from "lucide-react";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency?: string;
  categoryName?: string;
  imageUrl?: string;
  inStock?: boolean;
  stockQuantity?: number;
  matchReason?: string;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({
  id,
  name,
  slug,
  description,
  priceCents,
  currency = "USD",
  categoryName,
  imageUrl = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
  inStock = true,
  stockQuantity,
  matchReason,
  onAddToCart,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [added, setAdded] = React.useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    if (onAddToCart) {
      await onAddToCart(id);
    } else {
      // Dispatch custom cart event for global cart drawer listener
      window.dispatchEvent(
        new CustomEvent("atelier:add-to-cart", {
          detail: { productId: id, name, priceCents, imageUrl },
        })
      );
    }
    setIsAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isLowStock = inStock && stockQuantity !== undefined && stockQuantity <= 3 && stockQuantity > 0;

  return (
    <Card className="group overflow-hidden rounded-lg border border-border bg-surface transition-all duration-320 hover:border-accent/40 hover:shadow-elevation2 flex flex-col h-full">
      <Link href={`/products/${slug}`} className="flex-1 flex flex-col">
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-320 group-hover:scale-105"
            loading="lazy"
          />
          {matchReason && (
            <Badge
              variant="accent"
              className="absolute top-3 left-3 shadow-elevation1 flex items-center gap-1 text-[11px] backdrop-blur-sm"
            >
              <Sparkles className="w-3 h-3" /> AI Pick
            </Badge>
          )}

          {/* Stock Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
            {!inStock ? (
              <Badge variant="destructive" className="text-[11px]">
                Sold Out
              </Badge>
            ) : isLowStock ? (
              <Badge variant="warning" className="text-[11px]">
                Only {stockQuantity} left
              </Badge>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <CardHeader className="p-4 pb-1">
          {categoryName && (
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {categoryName}
            </span>
          )}
          <CardTitle className="font-display text-scale-16 font-medium text-foreground transition-colors group-hover:text-accent line-clamp-1">
            {name}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 pt-0 flex-1">
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
          {matchReason && (
            <p className="mt-2 text-[11px] text-accent/90 italic line-clamp-1">
              {matchReason}
            </p>
          )}
        </CardContent>
      </Link>

      {/* Footer */}
      <CardFooter className="p-4 pt-2 flex items-center justify-between border-t border-border/50">
        <span className="font-semibold text-scale-16 text-foreground">
          {formatPrice(priceCents, currency)}
        </span>
        <Button
          size="sm"
          variant={added ? "default" : "outline"}
          disabled={!inStock || isAdding}
          onClick={handleAdd}
          className="text-xs transition-all duration-200"
          aria-label={`Add ${name} to cart`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1 text-success-foreground" /> Added
            </>
          ) : !inStock ? (
            "Unavailable"
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Add
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
