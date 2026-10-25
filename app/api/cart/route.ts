import { NextRequest, NextResponse } from "next/server";
import { getOrCreateCart, getCartDetails } from "@/lib/cart";
import { db } from "@/lib/db";
import { cartItems, productVariants } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { addToCartSchema, updateCartItemSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const cartId = await getOrCreateCart();
    const details = await getCartDetails(cartId);
    return NextResponse.json(details);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = addToCartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid item payload", details: parsed.error.format() }, { status: 400 });
    }

    const { variantId, quantity } = parsed.data;

    // Verify variant existence and stock
    const variant = await db.query.productVariants.findFirst({
      where: eq(productVariants.id, variantId),
    });

    if (!variant) {
      return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
    }

    if (variant.stockQuantity < quantity) {
      return NextResponse.json(
        { error: `Only ${variant.stockQuantity} unit(s) remaining in workshop.` },
        { status: 400 }
      );
    }

    const cartId = await getOrCreateCart();

    // Check if item already exists in cart
    const existing = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)),
    });

    if (existing) {
      const newQuantity = existing.quantity + quantity;
      if (variant.stockQuantity < newQuantity) {
        return NextResponse.json(
          { error: `Cannot add more. Workshop stock limit reached (${variant.stockQuantity}).` },
          { status: 400 }
        );
      }
      await db.update(cartItems).set({ quantity: newQuantity }).where(eq(cartItems.id, existing.id));
    } else {
      await db.insert(cartItems).values({
        cartId,
        variantId,
        quantity,
      });
    }

    const updatedDetails = await getCartDetails(cartId);
    return NextResponse.json(updatedDetails);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Cart update failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = updateCartItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { cartItemId, quantity } = parsed.data;
    const cartId = await getOrCreateCart();

    if (quantity === 0) {
      await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cartId)));
    } else {
      await db.update(cartItems).set({ quantity }).where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cartId)));
    }

    const updated = await getCartDetails(cartId);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get("id");

    if (!cartItemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    const cartId = await getOrCreateCart();
    await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cartId)));

    const updated = await getCartDetails(cartId);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
