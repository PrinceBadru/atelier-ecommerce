import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  vector,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

// 1. Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  role: text("role", { enum: ["shopper", "admin"] }).default("shopper").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Better Auth tables support
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Categories table
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Products table
export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").default("USD").notNull(),
    categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
    status: text("status", { enum: ["draft", "active"] }).default("active").notNull(),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    attributes: jsonb("attributes").default(sql`'{}'::jsonb`).notNull(),
    embedding: vector("embedding", { dimensions: 768 }),
    embeddingTextHash: text("embedding_text_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("product_slug_idx").on(table.slug),
    index("product_category_idx").on(table.categoryId),
    index("product_status_idx").on(table.status),
    index("product_embedding_hnsw_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
  ]
);

// 4. Product Variants table
export const productVariants = pgTable("product_variants", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(),
  optionValues: jsonb("option_values").default(sql`'{}'::jsonb`).notNull(), // e.g. { size: "M", color: "Oat" }
  priceCentsOverride: integer("price_cents_override"),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 5. Product Images table
export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: text("alt_text").notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 6. Reviews table
export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  authorName: text("author_name").default("Verified Customer").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Review summary cache per product (Phase 8)
export const productReviewSummaries = pgTable("product_review_summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").notNull().unique().references(() => products.id, { onDelete: "cascade" }),
  verdict: text("verdict").notNull(),
  pros: text("pros").array().notNull().default(sql`'{}'::text[]`),
  cons: text("cons").array().notNull().default(sql`'{}'::text[]`),
  reviewCountSnapshot: integer("review_count_snapshot").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 7. Cart & Cart Items table
export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 8. Orders & Order Items table
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  guestEmail: text("guest_email"),
  status: text("status", { enum: ["pending", "paid", "fulfilled", "cancelled"] }).default("pending").notNull(),
  totalCents: integer("total_cents").notNull(),
  stripeSessionId: text("stripe_session_id").unique(),
  shippingAddress: jsonb("shipping_address").default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  nameSnapshot: text("name_snapshot").notNull(),
  priceCentsSnapshot: integer("price_cents_snapshot").notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 9. Browse Events (recommendations)
export const browseEvents = pgTable("browse_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userOrSession: text("user_or_session").notNull(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  eventType: text("event_type", { enum: ["view", "add_to_cart", "purchase"] }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 10. AI Logs table
export const aiLogs = pgTable("ai_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  feature: text("feature").notNull(), // "search", "chat", "summary", "admin_draft"
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").default(0).notNull(),
  outputTokens: integer("output_tokens").default(0).notNull(),
  latencyMs: integer("latency_ms").default(0).notNull(),
  costEstimate: text("cost_estimate").default("0.000").notNull(),
  traceId: text("trace_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Drizzle Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
  reviews: many(reviews),
  reviewSummary: one(productReviewSummaries, {
    fields: [products.id],
    references: [productReviewSummaries.productId],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_parent",
  }),
  children: many(categories, { relationName: "category_parent" }),
  products: many(products),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

// Export Types
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
