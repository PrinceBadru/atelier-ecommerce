import { NextRequest, NextResponse } from "next/server";
import { stripe, handleSuccessfulCheckout } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  if (webhookSecret && webhookSecret !== "whsec_placeholder" && signature) {
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // For test simulation or unconfigured webhook secret
    try {
      event = JSON.parse(payload);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const items = session.metadata?.items_json ? JSON.parse(session.metadata.items_json) : [];

    await handleSuccessfulCheckout({
      stripeSessionId: session.id,
      customerEmail: session.customer_details?.email || session.customer_email || "shopper@atelier.dev",
      shippingAddress: session.shipping_details?.address || {},
      items,
      totalCents: session.amount_total || 0,
    });
  }

  return NextResponse.json({ received: true });
}
