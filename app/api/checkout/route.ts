import { NextRequest, NextResponse } from "next/server";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { getOrCreateCart, getCartDetails } from "@/lib/cart";

export async function POST(req: NextRequest) {
  try {
    const cartId = await getOrCreateCart();
    const cartDetails = await getCartDetails(cartId);

    if (cartDetails.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const items = cartDetails.items.map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
    }));

    const session = await createStripeCheckoutSession({
      items,
      successUrl: `${baseUrl}/orders/success`,
      cancelUrl: `${baseUrl}/cart`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.sessionId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to initiate checkout" }, { status: 500 });
  }
}
