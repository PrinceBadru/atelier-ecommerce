import { db } from "@/lib/db";
import { aiLogs } from "@/lib/db/schema";

export interface ModelCallMetadata {
  feature: "chat" | "search_understanding" | "review_summary" | "admin_copywriting";
  model: string;
  traceId?: string;
}

export interface InstrumentResult<T> {
  result: T;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  costEstimate: string;
}

/**
 * Calculates estimated cost for Gemini 1.5/2.5 Flash models
 * (Approx $0.075 per 1M input tokens, $0.30 per 1M output tokens).
 */
export function estimateGeminiCost(inputTokens: number, outputTokens: number): string {
  const inputCost = (inputTokens / 1_000_000) * 0.075;
  const outputCost = (outputTokens / 1_000_000) * 0.30;
  const total = inputCost + outputCost;
  return total.toFixed(6);
}

/**
 * Instruments an AI model call, measuring duration, calculating token cost,
 * and persisting the trace to the ai_logs database table.
 */
export async function instrumentModelCall<T>(
  metadata: ModelCallMetadata,
  fn: () => Promise<{ output: T; usage?: { promptTokens?: number; completionTokens?: number } }>
): Promise<InstrumentResult<T>> {
  const startTime = Date.now();
  let inputTokens = 0;
  let outputTokens = 0;
  let result: T;

  try {
    const res = await fn();
    result = res.output;
    inputTokens = res.usage?.promptTokens ?? 0;
    outputTokens = res.usage?.completionTokens ?? 0;
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    // Log failure attempt
    try {
      await db.insert(aiLogs).values({
        feature: metadata.feature,
        model: metadata.model,
        latencyMs,
        costEstimate: "0.000000",
        traceId: metadata.traceId || null,
      });
    } catch {
      // Ignore db log failures during errors
    }
    throw err;
  }

  const latencyMs = Date.now() - startTime;
  const costEstimate = estimateGeminiCost(inputTokens, outputTokens);

  try {
    await db.insert(aiLogs).values({
      feature: metadata.feature,
      model: metadata.model,
      inputTokens,
      outputTokens,
      latencyMs,
      costEstimate,
      traceId: metadata.traceId || null,
    });
  } catch (logErr) {
    console.warn("Failed to record AI log:", logErr);
  }

  return {
    result,
    latencyMs,
    inputTokens,
    outputTokens,
    costEstimate,
  };
}
