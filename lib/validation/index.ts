import { z } from "zod";

// Product & Catalog Schemas
export const productFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  inStockOnly: z.coerce.boolean().optional().default(false),
  sort: z.enum(["featured", "price-asc", "price-desc", "newest"]).optional().default("featured"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(24),
  query: z.string().optional(),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;

// Natural Language Extracted Query Filters (Phase 6 Query Understanding)
export const naturalQueryFilterSchema = z.object({
  cleanedQuery: z.string(),
  category: z.string().nullable().optional(),
  minPrice: z.number().nullable().optional(),
  maxPrice: z.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
  material: z.string().nullable().optional(),
  intent: z.enum(["browse", "gift", "specific_item", "comparison"]).default("browse"),
  inStockOnly: z.boolean().default(true),
});

export type NaturalQueryFilter = z.infer<typeof naturalQueryFilterSchema>;

// Cart Actions Schemas
export const addToCartSchema = z.object({
  variantId: z.string().uuid("Invalid variant ID format"),
  quantity: z.number().int().min(1).max(10),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().uuid("Invalid cart item ID"),
  quantity: z.number().int().min(0).max(10),
});

// Checkout Schemas
export const checkoutSessionSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string().uuid(),
      quantity: z.number().int().min(1),
    })
  ).min(1, "Cart cannot be empty"),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

// Assistant Tool Schemas
export const assistantSearchToolSchema = z.object({
  query: z.string().describe("The item, material, function, or style the customer is looking for"),
  category: z.string().optional().describe("Optional product category"),
  maxPrice: z.number().optional().describe("Optional maximum budget in USD"),
});

export const assistantGetProductToolSchema = z.object({
  productId: z.string().describe("The UUID or exact slug of the product to inspect"),
});

export const assistantCheckStockToolSchema = z.object({
  productId: z.string().describe("The product ID to verify real-time inventory for"),
});

export const assistantCompareToolSchema = z.object({
  productIds: z.array(z.string()).min(2).max(4).describe("Array of product IDs to compare side-by-side"),
});

export const assistantAddToCartToolSchema = z.object({
  variantId: z.string().describe("The specific variant UUID to add (finish/size must be known)"),
  quantity: z.number().int().min(1).default(1),
});

export const assistantGetOrderStatusToolSchema = z.object({
  orderId: z.string().describe("The order UUID to check the fulfillment status for"),
});

// Admin Product Schema
export const adminProductCreateSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priceCents: z.number().int().positive("Price must be positive"),
  currency: z.literal("USD").default("USD"),
  categoryId: z.string().uuid("Category is required"),
  status: z.enum(["draft", "active"]).default("active"),
  tags: z.array(z.string()).default([]),
  attributes: z.record(z.any()).default({}),
  imageUrl: z.string().url().optional(),
});
