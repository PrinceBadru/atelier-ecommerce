"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ShieldCheck, CreditCard, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [shippingInfo, setShippingInfo] = React.useState({
    fullName: "Elena Rostova",
    email: "demo@atelier.dev",
    address: "742 Evergreen Terrace",
    city: "Portland",
    state: "OR",
    zip: "97201",
  });

  React.useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => {
        setCart(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        // Redirect to Stripe checkout or simulated confirmation
        router.push(data.url);
      } else {
        throw new Error(data.error || "Checkout error");
      }
    } catch (err: any) {
      alert("Checkout error: " + err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const items = cart?.items || [];
  const totalCents = cart?.totalCents || 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between">
        <Link href="/cart" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <Link href="/" className="font-display text-scale-20">
          Atelier
        </Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5 text-success" />
          <span>Secure Test Mode</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase text-accent font-medium mb-1">
            <span>Encrypted Checkout</span>
            <span>•</span>
            <span>Stripe Test Mode</span>
          </div>
          <h1 className="font-display text-scale-32 font-normal">Finalize Workshop Order</h1>
        </div>

        {/* Stripe Test Mode Banner */}
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-accent mt-0.5 shrink-0" />
          <div className="text-xs space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <span>Stripe Test Credentials Configured</span>
              <Badge variant="outline" className="text-[10px] bg-surface">Card: 4242 4242 4242 4242</Badge>
            </div>
            <p className="text-muted-foreground">
              This portfolio demo operates in safe Stripe Test Mode. No real credit card or bank transfer will be billed. Stock is decremented transactionally upon payment confirmation.
            </p>
          </div>
        </div>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Shipping Form */}
          <div className="md:col-span-2 space-y-6 rounded-lg border border-border bg-surface p-6 shadow-elevation1">
            <h2 className="font-display text-scale-16 font-semibold">1. Shipping Address</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-medium text-foreground">Full Name</label>
                <Input
                  required
                  value={shippingInfo.fullName}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-medium text-foreground">Email Address (for order tracking)</label>
                <Input
                  type="email"
                  required
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-medium text-foreground">Street Address</label>
                <Input
                  required
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">City</label>
                <Input
                  required
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Postal Code</label>
                <Input
                  required
                  value={shippingInfo.zip}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                />
              </div>
            </div>

            <h2 className="font-display text-scale-16 font-semibold pt-4 border-t border-border">
              2. Test Payment Details
            </h2>

            <div className="rounded-md border border-border bg-muted/30 p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono text-foreground font-semibold">4242 •••• •••• 4242</span>
                <span className="text-muted-foreground">Expires 12/28</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                CVC: 123 • Zero real charges applied
              </div>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="rounded-lg border border-border bg-surface p-6 shadow-elevation1 space-y-6">
            <h2 className="font-display text-scale-16 font-semibold">Order Items ({items.length})</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs divide-y divide-border/50">
              {items.map((i: any) => (
                <div key={i.cartItemId} className="pt-2 flex justify-between gap-2">
                  <div className="truncate">
                    <p className="font-medium text-foreground truncate">{i.name}</p>
                    <p className="text-muted-foreground text-[11px]">Qty: {i.quantity}</p>
                  </div>
                  <span className="font-semibold text-foreground shrink-0">
                    {formatPrice(i.priceCents * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-success font-medium">Free</span>
              </div>
              <div className="flex justify-between font-semibold text-scale-16 pt-2 border-t border-border">
                <span>Total Due</span>
                <span>{formatPrice(totalCents)}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting || items.length === 0}
              className="w-full text-xs shadow-elevation2"
            >
              {submitting ? "Confirming with Stripe..." : `Authorize Payment ${formatPrice(totalCents)}`}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
