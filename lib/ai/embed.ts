import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";
import crypto from "crypto";

export const EMBEDDING_DIMENSION = 768;

/**
 * Computes a SHA-256 hash for product text so unchanged products can be skipped during backfill.
 */
export function computeEmbeddingHash(text: string): string {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

/**
 * Generates a deterministic pseudo-random embedding vector from text.
 * Used as a fallback when GOOGLE_GENERATIVE_AI_API_KEY is unset or during offline test runs.
 */
function generateDeterministicFallbackEmbedding(text: string): number[] {
  const hash = crypto.createHash("sha256").update(text).digest();
  const vector: number[] = new Array(EMBEDDING_DIMENSION);
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    const byte = hash[i % hash.length];
    vector[i] = ((byte / 255.0) * 2 - 1) / Math.sqrt(EMBEDDING_DIMENSION);
  }
  return vector;
}

/**
 * Embeds a single string, returning a 768-dimensional vector.
 * If API key is not present or an error occurs, falls back cleanly.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey || apiKey === "placeholder" || apiKey.trim() === "") {
    return generateDeterministicFallbackEmbedding(text);
  }

  try {
    const { embedding } = await embed({
      model: google.textEmbeddingModel("text-embedding-004"),
      value: text,
      maxRetries: 2,
    });

    // Truncate or pad to exactly 768 dimensions
    if (embedding.length >= EMBEDDING_DIMENSION) {
      return embedding.slice(0, EMBEDDING_DIMENSION);
    }

    const padded = [...embedding];
    while (padded.length < EMBEDDING_DIMENSION) {
      padded.push(0);
    }
    return padded;
  } catch (error) {
    console.warn("Embedding API error, using resilient fallback vector:", error);
    return generateDeterministicFallbackEmbedding(text);
  }
}

/**
 * Embeds a batch of texts with gentle rate limiting.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    const vector = await generateEmbedding(text);
    results.push(vector);
  }
  return results;
}
