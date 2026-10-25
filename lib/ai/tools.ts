import { tool } from "ai";
import { db } from "@/lib/db";
import { products, productVariants, categories, productImages, orders, orderItems } from "@/lib/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import {
  assistantSearchToolSchema,
  assistantGetProductToolSchema,
  assistantCheckStockToolSchema,
  assistantCompareToolSchema,
  assistantAddToCartToolSchema,
  assistantGetOrderStatusToolSchema,
} from "../validation";
import { searchProducts } from "./search";

export const shoppingAssistantTools = {
  search_products: tool({
    description: "Search the Atelier catalog using natural keywords, materials, and price filters.",
    parameters: assistantSearchToolSchema,
    execute: async ({ query, category, maxPrice }) => {
      const results = await searchProducts(query, {
        categorySlug: category,
        maxPriceCents: maxPrice ? Math.round(maxPrice * 100) : undefined,
      });

      return {
        count: results.items.length,
        products: results.items.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          priceFormatted: `$${(p.priceCents / 100).toFixed(2)}`,
          category: p.categoryName,
          imageUrl: p.imageUrl,
          inStock: p.inStock,
          matchReason: p.matchReason,
        })),
      };
    },
  }),

  get_product: tool({
    description: "Retrieve comprehensive specifications, materials, care instructions, and variants for a product.",
    parameters: assistantGetProductToolSchema,
    execute: async ({ productId }) => {
      const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
          category: true,
          variants: true,
          images: true,
          reviews: { limit: 4 },
        },
      });

      if (!product) {
        return { error: `Product with ID "${productId}" was not found in our catalog.` };
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceFormatted: `$${(product.priceCents / 100).toFixed(2)}`,
        category: product.category.name,
        attributes: product.attributes,
        variants: product.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          options: v.optionValues,
          inStock: v.stockQuantity > 0,
          stockQuantity: v.stockQuantity,
        })),
        recentReviews: product.reviews.map((r) => ({
          rating: r.rating,
          title: r.title,
          body: r.body,
        })),
      };
    },
  }),

  check_stock: tool({
    description: "Check the exact live stock and inventory levels for a specific product and its variants.",
    parameters: assistantCheckStockToolSchema,
    execute: async ({ productId }) => {
      const variants = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, productId));

      if (variants.length === 0) {
        return { inStock: false, message: "No inventory variants found for this product." };
      }

      const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);
      return {
        productId,
        inStock: totalStock > 0,
        totalStock,
        variants: variants.map((v) => ({
          variantId: v.id,
          sku: v.sku,
          stockQuantity: v.stockQuantity,
          status: v.stockQuantity === 0 ? "Out of Stock" : v.stockQuantity <= 3 ? "Low Stock" : "In Stock",
        })),
      };
    },
  }),

  compare_products: tool({
    description: "Compare 2 to 4 products side-by-side on materials, dimensions, craftsmanship, and price.",
    parameters: assistantCompareToolSchema,
    execute: async ({ productIds }) => {
      const prods = await db.query.products.findMany({
        where: inArray(products.id, productIds),
        with: {
          category: true,
          variants: true,
          images: true,
        },
      });

      return {
        comparison: prods.map((p) => ({
          id: p.id,
          name: p.name,
          priceFormatted: `$${(p.priceCents / 100).toFixed(2)}`,
          category: p.category.name,
          materials: (p.attributes as any)?.material || "Artisanal",
          origin: (p.attributes as any)?.origin || "Studio",
          variantsCount: p.variants.length,
          imageUrl: p.images[0]?.url,
        })),
      };
    },
  }),

  add_to_cart: tool({
    description: "Add a specific validated product variant to the customer's shopping cart.",
    parameters: assistantAddToCartToolSchema,
    execute: async ({ variantId, quantity }) => {
      const variant = await db.query.productVariants.findFirst({
        where: eq(productVariants.id, variantId),
        with: {
          product: true,
        },
      });

      if (!variant) {
        return { success: false, error: "The requested variant does not exist." };
      }

      if (variant.stockQuantity < quantity) {
        return {
          success: false,
          error: `Insufficient stock. Only ${variant.stockQuantity} unit(s) available.`,
        };
      }

      return {
        success: true,
        message: `Added ${quantity}x "${variant.product.name}" to cart.`,
        variantId,
        productName: variant.product.name,
        quantity,
      };
    },
  }),

  get_order_status: tool({
    description: "Retrieve order tracking status, shipping updates, and purchase history for an order ID.",
    parameters: assistantGetOrderStatusToolSchema,
    execute: async ({ orderId }) => {
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: {
          items: true,
        },
      });

      if (!order) {
        return { found: false, message: `Order #${orderId} was not found.` };
      }

      return {
        found: true,
        orderId: order.id,
        status: order.status,
        totalFormatted: `$${(order.totalCents / 100).toFixed(2)}`,
        itemsCount: order.items.length,
        createdAt: order.createdAt,
      };
    },
  }),
};
