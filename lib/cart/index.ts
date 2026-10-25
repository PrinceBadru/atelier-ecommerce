import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { carts, cartItems, productVariants, products, productImages } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";

const CART_COOKIE_NAME = "atelier_cart_session";

export interface CartItemDetail {
  cartItemId: string;
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  optionValues: Record<string, string>;
  priceCents: number;
  quantity: number;
  stockQuantity: number;
  imageUrl: string;
}

export interface CartDetail {
  cartId: string;
  items: CartItemDetail[];
  totalCents: number;
  itemCount: number;
}

/**
 * Retrieves the current session cart or creates one using session cookie.
 */
export async function getOrCreateCart(userId?: string): Promise<string> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (userId) {
    const existingUserCart = await db.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });
    if (existingUserCart) {
      return existingUserCart.id;
    }
  }

  if (sessionCookie) {
    const existingSessionCart = await db.query.carts.findFirst({
      where: eq(carts.sessionId, sessionCookie),
    });
    if (existingSessionCart) {
      return existingSessionCart.id;
    }
  }

  // Create new cart
  const newSessionId = crypto.randomUUID();
  const [createdCart] = await db
    .insert(carts)
    .values({
      userId: userId || null,
      sessionId: newSessionId,
    })
    .returning();

  cookieStore.set(CART_COOKIE_NAME, newSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return createdCart.id;
}

/**
 * Returns full detailed cart contents.
 */
export async function getCartDetails(cartId: string): Promise<CartDetail> {
  const items = await db
    .select({
      cartItemId: cartItems.id,
      quantity: cartItems.quantity,
      variantId: productVariants.id,
      sku: productVariants.sku,
      optionValues: productVariants.optionValues,
      stockQuantity: productVariants.stockQuantity,
      priceOverride: productVariants.priceCentsOverride,
      productId: products.id,
      productName: products.name,
      basePriceCents: products.priceCents,
      imageUrl: productImages.url,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .where(eq(cartItems.cartId, cartId));

  // Deduplicate joined images
  const uniqueItemsMap = new Map<string, CartItemDetail>();

  for (const item of items) {
    if (uniqueItemsMap.has(item.cartItemId)) continue;

    const effectivePrice = item.priceOverride ?? item.basePriceCents;
    uniqueItemsMap.set(item.cartItemId, {
      cartItemId: item.cartItemId,
      variantId: item.variantId,
      productId: item.productId,
      name: item.productName,
      sku: item.sku,
      optionValues: (item.optionValues as Record<string, string>) || {},
      priceCents: effectivePrice,
      quantity: item.quantity,
      stockQuantity: item.stockQuantity,
      imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
    });
  }

  const detailedItems = Array.from(uniqueItemsMap.values());
  const totalCents = detailedItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const itemCount = detailedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartId,
    items: detailedItems,
    totalCents,
    itemCount,
  };
}

/**
 * Merges a guest session cart into a registered user cart on sign-in.
 */
export async function mergeGuestCartIntoUserCart(userId: string, sessionId: string) {
  const guestCart = await db.query.carts.findFirst({
    where: eq(carts.sessionId, sessionId),
    with: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) return;

  let userCart = await db.query.carts.findFirst({
    where: eq(carts.userId, userId),
  });

  if (!userCart) {
    // Re-assign the guest cart to this user
    await db.update(carts).set({ userId }).where(eq(carts.id, guestCart.id));
    return;
  }

  // Merge items
  for (const item of guestCart.items) {
    const existing = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, userCart.id), eq(cartItems.variantId, item.variantId)),
    });

    if (existing) {
      await db
        .update(cartItems)
        .set({ quantity: existing.quantity + item.quantity })
        .where(eq(cartItems.id, existing.id));
    } else {
      await db.insert(cartItems).values({
        cartId: userCart.id,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }
  }

  // Delete guest cart
  await db.delete(carts).where(eq(carts.id, guestCart.id));
}
