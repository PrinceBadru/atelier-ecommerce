"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const [cart, setCart] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to load cart");
      const data = await res.json();
      setCart(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (cartItemId: string, newQty: number) => {
    if (!cart) return;

    // Optimistic update
    const previousItems = [...cart.items];
    const updatedItems = cart.items
      .map((item: any) => (item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item))
      .filter((item: any) => item.quantity > 0);

    const newTotal = updatedItems.reduce((acc: number, item: any) => acc + item.priceCents * item.quantity, 0);
    setCart({ ...cart, items: updatedItems, totalCents: newTotal });

    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity: newQty }),
      });
      if (!res.ok) throw new Error("Could not update item");
      const fresh = await res.json();
      setCart(fresh);
    } catch {
      // Rollback on failure
      setCart({ ...cart, items: previousItems });
    }
  };

  const removeItem = async (cartItemId: string) => {
    updateQuantity(cartItemId, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Gathering your workshop selections...</p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between">
        <Link href="/products" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Return to Catalog
        </Link>
        <Link href="/" className="font-display text-scale-20">
          Atelier
        </Link>
        <div className="w-16" />
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="mb-8">
          <h1 className="font-display text-scale-32 font-normal">Workshop Cart</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review your considered goods before safe test checkout.
          </p>
        </div>

        {isEmpty ? (
          <div className="rounded-xl border border-dashed border-border bg-surface p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="font-display text-scale-20 font-medium">Your cart is currently empty</h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You haven&apos;t added any goods to your order yet. Explore our handcrafted stoneware, linen, and field essentials.
            </p>
            <Link href="/products">
              <Button size="sm">Explore Collections</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Items List */}
            <div className="md:col-span-2 space-y-4">
              {items.map((item: any) => (
                <div
                  key={item.cartItemId}
                  className="rounded-lg border border-border bg-surface p-4 flex gap-4 items-center shadow-elevation1"
                >
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <Link
                      href={`/products`}
                      className="font-display text-scale-16 font-medium hover:text-accent truncate block"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {Object.values(item.optionValues).join(" / ") || item.sku}
                    </div>
                    <div className="text-xs font-semibold text-foreground">
                      {formatPrice(item.priceCents)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-border rounded-md bg-background">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="p-1.5 hover:bg-muted text-muted-foreground"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        disabled={item.quantity >= item.stockQuantity}
                        className="p-1.5 hover:bg-muted text-muted-foreground disabled:opacity-30"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="p-2 text-muted-foreground hover:text-danger"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Checkout */}
            <div className="rounded-lg border border-border bg-surface p-6 shadow-elevation1 space-y-6">
              <h2 className="font-display text-scale-16 font-semibold">Order Summary</h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(cart.totalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Shipping</span>
                  <span className="text-success font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-scale-16 font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(cart.totalCents)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button size="lg" className="w-full text-xs">
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>Encrypted Stripe Test Payment</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
