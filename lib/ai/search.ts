import { db } from "@/lib/db";
import { products, productVariants, categories, productImages } from "@/lib/db/schema";
import { generateEmbedding } from "./embed";
import { sql, eq, and, gte, lte, inArray } from "drizzle-orm";
import { naturalQueryFilterSchema, type NaturalQueryFilter } from "../validation";

export interface SearchFilters {
  categorySlug?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  inStockOnly?: boolean;
}

export interface SearchResultItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  categoryName: string;
  categorySlug: string;
  imageUrl: string;
  inStock: boolean;
  score: number;
  matchReason: string;
}

// 10-minute in-memory query cache
const searchCache = new Map<string, { timestamp: number; results: SearchResultItem[] }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Reciprocal Rank Fusion (RRF) merge algorithm.
 * Formula: RRF_score(doc) = sum(1 / (k + rank)) where standard k = 60
 */
export function reciprocalRankFusion<T extends { id: string }>(
  rankings: Array<T[]>,
  k: number = 60
): Map<string, { doc: T; score: number }> {
  const scoreMap = new Map<string, { doc: T; score: number }>();

  for (const rankingList of rankings) {
    rankingList.forEach((doc, index) => {
      const rank = index + 1;
      const rrf = 1 / (k + rank);
      const existing = scoreMap.get(doc.id);
      if (existing) {
        existing.score += rrf;
      } else {
        scoreMap.set(doc.id, { doc, score: rrf });
      }
    });
  }

  return scoreMap;
}

/**
 * Fast Query Understanding: extracts semantic category, budget constraints, and intent.
 */
export function extractQueryUnderstanding(query: string): NaturalQueryFilter {
  const lower = query.toLowerCase();
  let category: string | null = null;
  let maxPrice: number | null = null;
  let minPrice: number | null = null;
  let intent: NaturalQueryFilter["intent"] = "browse";

  // Intent classification
  if (lower.includes("gift") || lower.includes("present")) intent = "gift";
  else if (lower.includes("compare") || lower.includes("difference")) intent = "comparison";
  else if (lower.includes("looking for") || lower.includes("need a")) intent = "specific_item";

  // Price constraints (e.g. "under 50", "under $50", "below 100")
  const underPriceMatch = lower.match(/(?:under|below|less than)\s*\$?(\d+)/i);
  if (underPriceMatch) {
    maxPrice = parseInt(underPriceMatch[1], 10);
  }

  // Domain keyword to category mapping
  if (/coffee|tea|matcha|plate|mug|cup|pitcher|stoneware|ceramic|tableware|dish/i.test(lower)) {
    category = "ceramics-tableware";
  } else if (/linen|blanket|throw|towel|bath sheet|runner|textile|bedding/i.test(lower)) {
    category = "linen-textiles";
  } else if (/cast iron|skillet|dutch oven|pan|cookware|roasting/i.test(lower)) {
    category = "cast-iron-cookware";
  } else if (/canvas|bag|backpack|field bag|duffle|tool roll|waxed/i.test(lower)) {
    category = "waxed-canvas-bags";
  } else if (/camp|hiking|trail|stove|backpacking|outdoor/i.test(lower)) {
    category = "camp-trail-essentials";
  } else if (/candle|beeswax|taper|lighting|brass/i.test(lower)) {
    category = "lighting-candles";
  } else if (/cutting board|chopping|spoon|wood|walnut|cherrywood/i.test(lower)) {
    category = "wooden-goods";
  } else if (/incense|hinoki|scent|fragrance|aromatic/i.test(lower)) {
    category = "aromatics-incense";
  } else if (/garden|trowel|watering can|copper|plant|botany/i.test(lower)) {
    category = "gardening-botany";
  }

  return {
    cleanedQuery: query.replace(/(?:under|below|less than)\s*\$?\d+/gi, "").trim(),
    category,
    minPrice,
    maxPrice,
    intent,
    inStockOnly: true,
  };
}
function deriveMatchReason(
  query: string,
  productName: string,
  categoryName: string,
  attributes: Record<string, any>
): string {
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const matchedFeatures: string[] = [];

  for (const word of queryWords) {
    if (productName.toLowerCase().includes(word)) {
      matchedFeatures.push(`matches "${word}" in product name`);
      break;
    }
  }

  if (attributes?.material && queryWords.some((w) => attributes.material.toLowerCase().includes(w))) {
    matchedFeatures.push(`crafted with ${attributes.material}`);
  }

  if (attributes?.origin && queryWords.some((w) => attributes.origin.toLowerCase().includes(w))) {
    matchedFeatures.push(`sourced from ${attributes.origin}`);
  }

  if (matchedFeatures.length > 0) {
    return `Selected because it ${matchedFeatures.join(" and ")}.`;
  }

  return `Top curated match within the ${categoryName} collection.`;
}

/**
 * Hybrid Semantic Search combining Vector Cosine Similarity and Postgres Full-Text Search.
 */
export async function searchProducts(
  rawQuery: string,
  filters: SearchFilters = {},
  topK: number = 24
): Promise<{ items: SearchResultItem[]; understoodFilters?: NaturalQueryFilter }> {
  const normalizedCacheKey = `${rawQuery.trim().toLowerCase()}_${JSON.stringify(filters)}`;
  const cached = searchCache.get(normalizedCacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { items: cached.results };
  }

  const cleanedQuery = rawQuery.trim();
  const understood = extractQueryUnderstanding(cleanedQuery);
  const effectiveCategory = filters.categorySlug || understood.category || undefined;
  const effectiveMaxPrice = filters.maxPriceCents ?? (understood.maxPrice ? understood.maxPrice * 100 : undefined);

  // Parallel Execution: (1) Vector Search & (2) Full-Text Search
  const [vectorCandidates, fulltextCandidates] = await Promise.all([
    // Vector similarity search (top 40)
    (async () => {
      try {
        if (!cleanedQuery) return [];
        const embedding = await generateEmbedding(cleanedQuery);
        const vectorStr = `[${embedding.join(",")}]`;

        const vectorResults = await db.execute<{
          id: string;
          similarity: number;
        }>(sql`
          SELECT id, 1 - (embedding <=> ${vectorStr}::vector) AS similarity
          FROM products
          WHERE status = 'active' AND embedding IS NOT NULL
          ORDER BY embedding <=> ${vectorStr}::vector ASC
          LIMIT 40;
        `);

        return (vectorResults as any[]).map((r) => ({ id: r.id }));
      } catch (err) {
        console.warn("Vector search failed, falling back to full-text only:", err);
        return [];
      }
    })(),

    // PostgreSQL Full-Text Rank Search (top 40)
    (async () => {
      try {
        if (!cleanedQuery) return [];
        const ftsResults = await db.execute<{
          id: string;
          rank: number;
        }>(sql`
          SELECT p.id, ts_rank_cd(
            to_tsvector('english', p.name || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || c.name),
            plainto_tsquery('english', ${cleanedQuery})
          ) AS rank
          FROM products p
          INNER JOIN categories c ON p.category_id = c.id
          WHERE p.status = 'active'
            AND to_tsvector('english', p.name || ' ' || p.description || ' ' || array_to_string(p.tags, ' ') || ' ' || c.name) @@ plainto_tsquery('english', ${cleanedQuery})
          ORDER BY rank DESC
          LIMIT 40;
        `);

        return (ftsResults as any[]).map((r) => ({ id: r.id }));
      } catch (err) {
        console.warn("Full-text search failed:", err);
        return [];
      }
    })(),
  ]);

  // Reciprocal Rank Fusion merge
  const rrfScores = reciprocalRankFusion([vectorCandidates, fulltextCandidates]);

  // If no hybrid matches found (e.g. empty query or new database), fetch recent active products
  let candidateIds = Array.from(rrfScores.keys());
  if (candidateIds.length === 0) {
    const fallbackProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.status, "active"))
      .limit(40);
    candidateIds = fallbackProducts.map((p) => p.id);
  }

  if (candidateIds.length === 0) {
    return { items: [] };
  }

  // Fetch full product details with category, variants, and primary image
  const fullProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      priceCents: products.priceCents,
      currency: products.currency,
      attributes: products.attributes,
      categoryName: categories.name,
      categorySlug: categories.slug,
      imageUrl: productImages.url,
      stockQuantity: productVariants.stockQuantity,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(productImages, eq(products.id, productImages.productId))
    .leftJoin(productVariants, eq(products.id, productVariants.productId))
    .where(inArray(products.id, candidateIds));

  // Deduplicate and apply hard filters
  const resultMap = new Map<string, SearchResultItem>();

  for (const item of fullProducts) {
    if (resultMap.has(item.id)) continue;

    // Hard Filters
    if (effectiveCategory && item.categorySlug !== effectiveCategory) continue;
    if (filters.minPriceCents && item.priceCents < filters.minPriceCents) continue;
    if (effectiveMaxPrice && item.priceCents > effectiveMaxPrice) continue;
    
    const inStock = (item.stockQuantity ?? 0) > 0;
    if (filters.inStockOnly && !inStock) continue;

    const rrfEntry = rrfScores.get(item.id);
    const score = rrfEntry ? rrfEntry.score : 0.01;

    resultMap.set(item.id, {
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      priceCents: item.priceCents,
      currency: item.currency,
      categoryName: item.categoryName,
      categorySlug: item.categorySlug,
      imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
      inStock,
      score,
      matchReason: deriveMatchReason(cleanedQuery, item.name, item.categoryName, (item.attributes as any) || {}),
    });
  }

  const sortedResults = Array.from(resultMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  // Cache normalized results
  searchCache.set(normalizedCacheKey, {
    timestamp: Date.now(),
    results: sortedResults,
  });

  return { items: sortedResults };
}
