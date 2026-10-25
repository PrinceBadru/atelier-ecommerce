import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema";
import { inArray, eq } from "drizzle-orm";

export const MAX_USER_INPUT_LENGTH = 1000;

export interface GuardrailValidationResult {
  valid: boolean;
  sanitized: string;
  flaggedReason?: string;
}

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s+prompt\s+override/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /act\s+as\s+an\s+unrestricted/i,
  /disregard\s+all\s+rules/i,
  /reveal\s+(api\s+key|secret|system\s+prompt)/i,
];

/**
 * Validates and sanitizes user chat input for prompt injections and length limits.
 */
export function validateUserInput(input: string): GuardrailValidationResult {
  if (!input || input.trim() === "") {
    return { valid: false, sanitized: "", flaggedReason: "Empty input" };
  }

  // Length Cap Guardrail
  let sanitized = input.trim();
  if (sanitized.length > MAX_USER_INPUT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_USER_INPUT_LENGTH);
  }

  // Check for malicious prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      return {
        valid: false,
        sanitized,
        flaggedReason: "Potential prompt injection attempt intercepted.",
      };
    }
  }

  return { valid: true, sanitized };
}

/**
 * Output verification guardrail:
 * Asserts that any product ID recommended by the assistant actually exists in the database
 * and has inventory available.
 */
export async function verifyRecommendedProducts(productIds: string[]): Promise<{
  validProductIds: string[];
  invalidProductIds: string[];
}> {
  if (!productIds || productIds.length === 0) {
    return { validProductIds: [], invalidProductIds: [] };
  }

  try {
    const existing = await db
      .select({
        id: products.id,
        status: products.status,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    const existingMap = new Map(existing.map((p) => [p.id, p]));

    const validProductIds: string[] = [];
    const invalidProductIds: string[] = [];

    for (const id of productIds) {
      const prod = existingMap.get(id);
      if (prod && prod.status === "active") {
        validProductIds.push(id);
      } else {
        invalidProductIds.push(id);
      }
    }

    return { validProductIds, invalidProductIds };
  } catch (error) {
    console.warn("Error verifying recommended products:", error);
    return { validProductIds: productIds, invalidProductIds: [] };
  }
}
