import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../lib/db/schema";
import { eq, isNull, or } from "drizzle-orm";
import { generateEmbedding, computeEmbeddingHash } from "../lib/ai/embed";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5433/atelier";

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

// Helper to delay execution (rate limit adherence)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function backfillEmbeddings() {
  console.log("Starting product embedding backfill process...");

  // Fetch all active products
  const productList = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      description: schema.products.description,
      tags: schema.products.tags,
      attributes: schema.products.attributes,
      embedding: schema.products.embedding,
      embeddingTextHash: schema.products.embeddingTextHash,
    })
    .from(schema.products)
    .where(eq(schema.products.status, "active"));

  console.log(`Found ${productList.length} active products to evaluate.`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < productList.length; i++) {
    const p = productList[i];

    // Combine name, description, tags, and attributes into canonical search string
    const tagsStr = (p.tags || []).join(", ");
    const attrsStr = p.attributes ? JSON.stringify(p.attributes) : "";
    const canonicalText = `${p.name}. ${p.description}. Tags: ${tagsStr}. Details: ${attrsStr}`;

    const currentHash = computeEmbeddingHash(canonicalText);

    // Skip if unchanged and already embedded
    if (p.embeddingTextHash === currentHash && p.embedding !== null) {
      skippedCount++;
      continue;
    }

    console.log(`[${i + 1}/${productList.length}] Embedding product "${p.name}"...`);

    let embedding: number[] | null = null;
    let attempts = 0;

    while (attempts < 3) {
      try {
        attempts++;
        embedding = await generateEmbedding(canonicalText);
        break;
      } catch (err: any) {
        if (err?.status === 429) {
          console.warn("Rate limit encountered. Backing off for 5000ms...");
          await delay(5000);
        } else {
          console.warn(`Error on attempt ${attempts}:`, err?.message || err);
          await delay(1000);
        }
      }
    }

    if (embedding) {
      await db
        .update(schema.products)
        .set({
          embedding,
          embeddingTextHash: currentHash,
          updatedAt: new Date(),
        })
        .where(eq(schema.products.id, p.id));

      updatedCount++;
    }

    // Free tier rate pacing: stay well under 15 requests per minute
    // 50ms pause if fallback or 2500ms pause if live Gemini API
    const isLiveApi = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY !== "placeholder");
    await delay(isLiveApi ? 2500 : 50);
  }

  console.log(
    `Backfill completed. Updated: ${updatedCount}, Skipped (unchanged): ${skippedCount}.`
  );

  await client.end();
  process.exit(0);
}

backfillEmbeddings().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
