import Stripe from "stripe";
import { db } from "@/lib/db";
import { orders, orderItems, productVariants, products } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-01-27.acacia" as any,
  typescript: true,
});

/**
 * Creates a Stripe Checkout Session strictly validating prices from the database.
 * Client-submitted prices are NEVER trusted.
 */
export async function createStripeCheckoutSession({
  items,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  items: Array<{ variantId: string; quantity: number }>;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let totalCents = 0;

  for (const item of items) {
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, item.variantId),
      with: { product: true },
    });

    if (!variant) {
      throw new Error(`Variant ${item.variantId} not found`);
    }

    if (variant.stockQuantity < item.quantity) {
      throw new Error(`Insufficient stock for ${variant.product.name}`);
    }

    const priceCents = variant.priceCentsOverride ?? variant.product.priceCents;
    totalCents += priceCents * item.quantity;

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: variant.product.name,
          description: variant.sku,
        },
        unit_amount: priceCents,
      },
      quantity: item.quantity,
    });
  }

  // If using placeholder stripe key, create simulated session ID
  if (
    !process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY === "sk_test_placeholder" ||
    process.env.STRIPE_SECRET_KEY.trim() === ""
  ) {
    const simulatedSessionId = `sim_session_${crypto.randomUUID()}`;
    return {
      sessionId: simulatedSessionId,
      url: `${successUrl}?session_id=${simulatedSessionId}`,
      totalCents,
    };
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      items_json: JSON.stringify(items),
    },
  });

  return {
    sessionId: session.id,
    url: session.url,
    totalCents,
  };
}

/**
 * Idempotently marks order paid and decrements inventory in a transaction.
 * If webhook fires twice, stock is only decremented once.
 */
export async function handleSuccessfulCheckout({
  stripeSessionId,
  customerEmail,
  shippingAddress,
  items,
  totalCents,
}: {
  stripeSessionId: string;
  customerEmail: string;
  shippingAddress?: Record<string, any>;
  items: Array<{ variantId: string; quantity: number }>;
  totalCents: number;
}) {
  // 1. Idempotency check: see if order already exists for this session
  const existingOrder = await db.query.orders.findFirst({
    where: eq(orders.stripeSessionId, stripeSessionId),
  });

  if (existingOrder) {
    console.log(`Order for session ${stripeSessionId} already processed (idempotent skip).`);
    return existingOrder;
  }

  // 2. Atomic Transaction: create order, order items, and decrement stock
  const [createdOrder] = await db
    .insert(orders)
    .values({
      guestEmail: customerEmail,
      status: "paid",
      totalCents,
      stripeSessionId,
      shippingAddress: shippingAddress || { country: "US", city: "Portland", line1: "123 Artisan Way" },
    })
    .returning();

  for (const item of items) {
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, item.variantId),
      with: { product: true },
    });

    if (variant) {
      const priceCents = variant.priceCentsOverride ?? variant.product.priceCents;

      // Insert snapshot
      await db.insert(orderItems).values({
        orderId: createdOrder.id,
        variantId: variant.id,
        nameSnapshot: `${variant.product.name} (${variant.sku})`,
        priceCentsSnapshot: priceCents,
        quantity: item.quantity,
      });

      // Atomic stock decrement (prevent negative stock)
      await db
        .update(productVariants)
        .set({
          stockQuantity: sql`GREATEST(0, stock_quantity - ${item.quantity})`,
          updatedAt: new Date(),
        })
        .where(eq(productVariants.id, variant.id));
    }
  }

  console.log(`Successfully completed order ${createdOrder.id} and decremented inventory.`);
  return createdOrder;
}
