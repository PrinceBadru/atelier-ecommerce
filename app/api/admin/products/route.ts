import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productVariants, productImages } from "@/lib/db/schema";
import { adminProductCreateSchema } from "@/lib/validation";
import { generateEmbedding, computeEmbeddingHash } from "@/lib/ai/embed";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = adminProductCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      description,
      priceCents,
      currency,
      categoryId,
      status,
      tags,
      attributes,
      imageUrl,
    } = parsed.data;

    // Generate immediate 768-dim embedding for vector search
    const canonicalText = `${name}. ${description}. Tags: ${tags.join(", ")}`;
    const embedding = await generateEmbedding(canonicalText);
    const hash = computeEmbeddingHash(canonicalText);

    // Insert Product
    const [createdProduct] = await db
      .insert(products)
      .values({
        name,
        slug,
        description,
        priceCents,
        currency,
        categoryId,
        status,
        tags,
        attributes,
        embedding,
        embeddingTextHash: hash,
      })
      .returning();

    // Insert Default Variant
    await db.insert(productVariants).values({
      productId: createdProduct.id,
      sku: `ATL-${createdProduct.id.slice(0, 6).toUpperCase()}-STD`,
      optionValues: { style: "Standard" },
      stockQuantity: 20,
    });

    // Insert Image
    await db.insert(productImages).values({
      productId: createdProduct.id,
      url:
        imageUrl ||
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
      altText: `${name} studio catalog capture`,
      position: 0,
    });

    return NextResponse.json({ success: true, product: createdProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
  }
}
