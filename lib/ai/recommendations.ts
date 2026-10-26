import { db } from "@/lib/db";
import {
  products,
  productImages,
  categories,
  orders,
  orderItems,
  productVariants,
  userProfiles,
  users,
} from "@/lib/db/schema";
import { generateEmbedding } from "@/lib/ai/embed";
import { sql, eq, and, notInArray, desc, inArray } from "drizzle-orm";

export interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  categoryName: string;
  categorySlug: string;
  imageUrl?: string;
  tags: string[];
  matchScore: number; // e.g. 96 (%)
  matchReason: string;
}

export interface RecommendationResponse {
  isPersonalized: boolean;
  userTitle?: string;
  userTasteSummary?: string;
  items: RecommendedProduct[];
}

/**
 * Normalizes pgvector cosine distance (typically 0.15 - 0.45) into an intuitive match percentage (82% - 99%).
 */
export function calculateMatchScore(cosineDistance: number | null | undefined): number {
  const distance = typeof cosineDistance === "number" && !isNaN(cosineDistance) ? cosineDistance : 0.25;
  const rawScore = 1 - distance;
  return Math.max(82, Math.min(99, Math.round(rawScore * 100)));
}

/**
 * Generates a human-grounded explanation for why a product was selected by the AI vector recommender.
 */
export function generateMatchReason(categoryName: string, tags?: string[] | null): string {
  if (tags && tags.length > 0 && tags[0]) {
    return `Curated for your ${tags[0]} aesthetic`;
  }
  return `Aligned with your ${categoryName.toLowerCase()} interest`;
}

let hasEnsuredTable = false;

export async function ensureUserProfilesTable() {
  if (hasEnsuredTable) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user_profiles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "preferred_categories" text[] DEFAULT '{}'::text[] NOT NULL,
        "style_affinities" text[] DEFAULT '{}'::text[] NOT NULL,
        "taste_notes" text,
        "preference_embedding" vector(768),
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    hasEnsuredTable = true;
  } catch (err) {
    console.warn("[AI Recommender] ensureUserProfilesTable note:", err);
  }
}

/**
 * Builds and caches a 768-dimensional vector embedding representing the user's collective taste profile.
 */
export async function buildUserProfileVector(userId: string): Promise<number[]> {
  await ensureUserProfilesTable();

  // 1. Fetch user & profile
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });

  // 2. Fetch recent orders to capture real acquisition history
  const userOrders = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    limit: 6,
    orderBy: [desc(orders.createdAt)],
    with: {
      items: {
        with: {
          variant: {
            with: {
              product: {
                with: { category: true },
              },
            },
          },
        },
      },
    },
  });

  const orderedTitles = userOrders.flatMap((o) =>
    o.items
      .map((i) => i.variant?.product?.name)
      .filter((name): name is string => Boolean(name))
  );

  const preferredCategories = profile?.preferredCategories?.length
    ? profile.preferredCategories.join(", ")
    : "Ceramics & Tableware, Belgian Linen, Hearth Cookware";

  const styleAffinities = profile?.styleAffinities?.length
    ? profile.styleAffinities.join(", ")
    : "Wabi-Sabi Minimalism, Natural Wood-Fired Clay, Heirloom Craft";

  const tasteNotes = profile?.tasteNotes || "";

  // 3. Synthesize semantic taste bio
  const bio = [
    `Artisan patron taste profile for ${user?.name || "Collector"}.`,
    `Preferred disciplines and categories: ${preferredCategories}.`,
    `Aesthetic style affinities: ${styleAffinities}.`,
    tasteNotes ? `Personal notes & preferences: ${tasteNotes}.` : "",
    orderedTitles.length
      ? `Previously acquired handcrafted objects: ${orderedTitles.join(", ")}.`
      : "Interested in morning rituals, tabletop composition, and tactile materials.",
  ]
    .filter(Boolean)
    .join(" ");

  // 4. Generate 768-dim embedding
  const embedding = await generateEmbedding(bio);

  // 5. Save or update userProfile record
  if (profile) {
    await db
      .update(userProfiles)
      .set({
        preferenceEmbedding: embedding,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.id, profile.id));
  } else {
    await db.insert(userProfiles).values({
      userId,
      preferredCategories: ["ceramics-tableware"],
      styleAffinities: ["Wabi-Sabi Minimalism"],
      tasteNotes: tasteNotes || "Mindful everyday artisan collector",
      preferenceEmbedding: embedding,
    });
  }

  return embedding;
}

/**
 * Returns personalized recommendations for an authenticated user, or curated fallbacks for guests.
 */
export async function getPersonalizedRecommendations(options: {
  userId?: string;
  limit?: number;
}): Promise<RecommendationResponse> {
  const limit = options.limit || 6;

  if (options.userId) {
    try {
      await ensureUserProfilesTable();

      const user = await db.query.users.findFirst({
        where: eq(users.id, options.userId),
      });

      let profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, options.userId),
      });

      let embedding = profile?.preferenceEmbedding;

      if (!embedding || embedding.length !== 768) {
        embedding = await buildUserProfileVector(options.userId);
        profile = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, options.userId),
        });
      }

      // Gather past purchased product IDs to avoid redundant recommendations
      const pastOrders = await db.query.orders.findMany({
        where: eq(orders.userId, options.userId),
        with: {
          items: {
            with: {
              variant: true,
            },
          },
        },
      });

      const purchasedProductIds = new Set<string>();
      pastOrders.forEach((o) => {
        o.items.forEach((i) => {
          if (i.variant?.productId) {
            purchasedProductIds.add(i.variant.productId);
          }
        });
      });

      const excludedIds = Array.from(purchasedProductIds);

      // Execute pgvector nearest-neighbor search
      const vectorStr = `[${embedding.join(",")}]`;

      const conditions = [
        eq(products.status, "active"),
        excludedIds.length > 0 ? notInArray(products.id, excludedIds) : undefined,
      ].filter(Boolean);

      const candidateProducts = await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
          priceCents: products.priceCents,
          currency: products.currency,
          categoryId: products.categoryId,
          tags: products.tags,
          attributes: products.attributes,
          cosineDistance: sql<number>`${products.embedding} <=> ${vectorStr}::vector`,
          categoryName: categories.name,
          categorySlug: categories.slug,
        })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(and(...conditions))
        .orderBy(sql`${products.embedding} <=> ${vectorStr}::vector`)
        .limit(limit);

      if (candidateProducts.length > 0) {
        // Fetch images for candidates
        const productIds = candidateProducts.map((p) => p.id);
        const images = await db.query.productImages.findMany({
          where: inArray(productImages.productId, productIds),
          orderBy: [productImages.position],
        });

        const imageMap = new Map<string, string>();
        images.forEach((img) => {
          if (!imageMap.has(img.productId)) {
            imageMap.set(img.productId, img.url);
          }
        });

        const items: RecommendedProduct[] = candidateProducts.map((p) => {
          const matchScore = calculateMatchScore(p.cosineDistance);
          const reason = generateMatchReason(p.categoryName, p.tags);

          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description,
            priceCents: p.priceCents,
            currency: p.currency,
            categoryName: p.categoryName,
            categorySlug: p.categorySlug,
            imageUrl: imageMap.get(p.id),
            tags: p.tags || [],
            matchScore,
            matchReason: reason,
          };
        });

        const firstName = user?.name ? user.name.split(" ")[0] : "Patron";

        return {
          isPersonalized: true,
          userTitle: `Curated for ${firstName}`,
          userTasteSummary: profile?.styleAffinities?.length
            ? `Tailored to your ${profile.styleAffinities.slice(0, 2).join(" & ")} affinities`
            : "Tailored to your workshop interests and collection history",
          items,
        };
      }
    } catch (err) {
      console.warn("[AI Recommender] Error computing personalized feed, falling back to curated:", err);
    }
  }

  // Fallback: Curated Studio Highlights
  const fallbackProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      priceCents: products.priceCents,
      currency: products.currency,
      categoryId: products.categoryId,
      tags: products.tags,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.status, "active"))
    .orderBy(desc(products.createdAt))
    .limit(limit);

  const productIds = fallbackProducts.map((p) => p.id);
  const images = await db.query.productImages.findMany({
    where: inArray(productImages.productId, productIds),
    orderBy: [productImages.position],
  });

  const imageMap = new Map<string, string>();
  images.forEach((img) => {
    if (!imageMap.has(img.productId)) {
      imageMap.set(img.productId, img.url);
    }
  });

  const items: RecommendedProduct[] = fallbackProducts.map((p, idx) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    priceCents: p.priceCents,
    currency: p.currency,
    categoryName: p.categoryName,
    categorySlug: p.categorySlug,
    imageUrl: imageMap.get(p.id),
    tags: p.tags || [],
    matchScore: 95 - idx * 2,
    matchReason: `Studio highlight in ${p.categoryName}`,
  }));

  return {
    isPersonalized: false,
    userTitle: "Curated Workshop Highlights",
    userTasteSummary: "Handcrafted selections from Kyoto, Flanders, and Oregon studios",
    items,
  };
}
