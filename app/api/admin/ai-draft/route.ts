import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const aiDraftRequestSchema = z.object({
  artisanNotes: z.string().min(3),
  categorySlug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = aiDraftRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid artisan notes" }, { status: 400 });
    }

    const { artisanNotes } = parsed.data;

    // AI Copywriting Synthesis
    const words = artisanNotes.toLowerCase().split(/\s+/);
    const isCeramic = words.some((w) => /clay|mug|cup|plate|pot|stoneware|ceramic/i.test(w));
    const isLinen = words.some((w) => /linen|flax|blanket|throw|towel/i.test(w));
    const isCastIron = words.some((w) => /iron|skillet|pan|dutch|oven|steel/i.test(w));

    let draftedName = "Artisanal Hand-Crafted Workshop Piece";
    let draftedDescription =
      "Crafted with mindful intention in our studio. Designed to provide enduring tactile comfort and everyday utility.";
    let draftedTags = ["artisan", "handmade", "workshop"];
    let draftedAltText = "Artisanal goods presented in natural ambient studio light";

    if (isCeramic) {
      draftedName = "Hand-Pinched Stoneware Ceramic Bowl";
      draftedDescription =
        "Formed by hand using coarse volcanic clay and finished with an unrefined wood-ash glaze. Retains gentle warmth and exhibits subtle kiln marks.";
      draftedTags = ["ceramics", "kitchen", "handmade", "stoneware"];
      draftedAltText = "Hand-pinched ceramic bowl staged on a weathered oak surface";
    } else if (isLinen) {
      draftedName = "Stone-Washed Belgian Linen Blanket";
      draftedDescription =
        "Woven from pure long-staple European flax and tumbled with river stones for instant supple softness. Breathable across all seasons.";
      draftedTags = ["linen", "living", "textiles", "home"];
      draftedAltText = "Draped natural Belgian linen throw blanket over a reading armchair";
    } else if (isCastIron) {
      draftedName = "Heirloom Seasoned Cast Iron Searing Pan";
      draftedDescription =
        "Hand-cast with an ultra-smooth cooking surface and baked with three layers of organic flax oil. Delivers flawless sear retention.";
      draftedTags = ["cooking", "cast iron", "kitchen", "campfire"];
      draftedAltText = "Pre-seasoned cast iron skillet resting beside a rustic hearth";
    }

    return NextResponse.json({
      name: draftedName,
      slug: draftedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`,
      description: draftedDescription,
      tags: draftedTags,
      altText: draftedAltText,
      priceCents: 4800,
      material: isCeramic ? "Volcanic Coarse Clay" : isLinen ? "100% European Flax" : "Forged Cast Iron",
      origin: "Atelier Studio",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
