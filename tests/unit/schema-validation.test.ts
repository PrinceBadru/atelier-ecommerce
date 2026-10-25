import { describe, it, expect } from "vitest";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  priceCents: z.number().int().positive(),
  currency: z.literal("USD"),
  status: z.enum(["draft", "active"]),
  tags: z.array(z.string()),
});

describe("Catalog Data Validation Schemas", () => {
  it("validates a compliant product input successfully", () => {
    const validProduct = {
      name: "Hand-Thrown Stoneware Mug",
      slug: "hand-thrown-stoneware-mug",
      priceCents: 3800,
      currency: "USD",
      status: "active",
      tags: ["ceramics", "kitchen", "handmade"],
    };
    const parsed = productSchema.safeParse(validProduct);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid slugs and negative prices", () => {
    const invalidProduct = {
      name: "Bad Item",
      slug: "Bad Item With Spaces!",
      priceCents: -500,
      currency: "USD",
      status: "active",
      tags: [],
    };
    const parsed = productSchema.safeParse(invalidProduct);
    expect(parsed.success).toBe(false);
  });
});
