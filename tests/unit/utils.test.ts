import { describe, it, expect } from "vitest";
import { cn, formatPrice } from "@/lib/utils";

describe("lib/utils", () => {
  it("merges class names correctly with twMerge and clsx", () => {
    const result = cn("px-4 py-2", "px-6", { "bg-primary": true, "hidden": false });
    expect(result).toBe("py-2 px-6 bg-primary");
  });

  it("formats prices in cents accurately to USD currency strings", () => {
    expect(formatPrice(1000)).toBe("$10.00");
    expect(formatPrice(3850)).toBe("$38.50");
    expect(formatPrice(0)).toBe("$0.00");
    expect(formatPrice(12900)).toBe("$129.00");
  });
});
