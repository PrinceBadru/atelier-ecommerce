import { describe, it, expect } from "vitest";
import {
  calculateMatchScore,
  generateMatchReason,
} from "@/lib/ai/recommendations";

describe("lib/ai/recommendations", () => {
  describe("calculateMatchScore", () => {
    it("normalizes small cosine distance to high match percentage", () => {
      // Very close match (cosine distance 0.05 => 95%)
      const score = calculateMatchScore(0.05);
      expect(score).toBe(95);
    });

    it("clamps scores to maximum of 99%", () => {
      // Exact match (cosine distance 0.0 => 100%, clamped to 99%)
      const score = calculateMatchScore(0.0);
      expect(score).toBe(99);
    });

    it("clamps scores to minimum of 82%", () => {
      // Distant match (cosine distance 0.40 => 60%, clamped to 82%)
      const score = calculateMatchScore(0.4);
      expect(score).toBe(82);
    });

    it("handles null or undefined distance gracefully with default baseline", () => {
      const scoreNull = calculateMatchScore(null);
      const scoreUndefined = calculateMatchScore(undefined);
      expect(scoreNull).toBe(82); // 1 - 0.25 = 0.75 => clamped to 82
      expect(scoreUndefined).toBe(82);
    });
  });

  describe("generateMatchReason", () => {
    it("prioritizes aesthetic tags when available", () => {
      const reason = generateMatchReason("Ceramics & Tableware", [
        "Wabi-Sabi",
        "Minimalist",
      ]);
      expect(reason).toBe("Curated for your Wabi-Sabi aesthetic");
    });

    it("falls back to category interest when tags are empty or null", () => {
      const reasonEmpty = generateMatchReason("Linen & Textiles", []);
      expect(reasonEmpty).toBe("Aligned with your linen & textiles interest");

      const reasonNull = generateMatchReason("Cast Iron & Cookware", null);
      expect(reasonNull).toBe("Aligned with your cast iron & cookware interest");
    });
  });
});
