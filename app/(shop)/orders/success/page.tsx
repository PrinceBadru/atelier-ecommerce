import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { handleSuccessfulCheckout } from "@/lib/stripe";
import { getOrCreateCart, getCartDetails } from "@/lib/cart";

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedParams = await searchParams;
  const sessionId = resolvedParams.session_id || `sim_${Date.now()}`;

  // Complete checkout & decrement stock transactionally
  let orderRecord: any = null;
  try {
    const cartId = await getOrCreateCart();
    const cartDetails = await getCartDetails(cartId);

    if (cartDetails.items.length > 0) {
      orderRecord = await handleSuccessfulCheckout({
        stripeSessionId: sessionId,
        customerEmail: "demo@atelier.dev",
        items: cartDetails.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        totalCents: cartDetails.totalCents,
      });
    }
  } catch (err) {
    console.warn("Order fulfillment handler notice:", err);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl p-8 shadow-elevation2 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-success/15 border border-success/30 flex items-center justify-center mx-auto text-success">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider text-accent font-medium">
            Order Confirmed & Paid
          </span>
          <h1 className="font-display text-scale-32 font-normal mt-1">Thank You</h1>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Your considered workshop goods have been reserved. A confirmation note has been dispatched to{" "}
            <span className="text-foreground font-medium">demo@atelier.dev</span>.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Reference</span>
            <span className="font-mono text-foreground font-semibold">
              {orderRecord?.id ? orderRecord.id.slice(0, 8).toUpperCase() : "ATL-9842"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fulfillment Status</span>
            <span className="text-success font-medium">Preparing in Workshop</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Dispatch</span>
            <span className="text-foreground">Within 2 business days</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link href="/products">
            <Button size="lg" className="w-full text-xs">
              Return to Catalog <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
          <Link href="/account">
            <Button variant="outline" size="sm" className="w-full text-xs">
              View Order in Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
