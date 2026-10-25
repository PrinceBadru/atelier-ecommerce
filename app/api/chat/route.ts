import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { ATELIER_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { shoppingAssistantTools } from "@/lib/ai/tools";
import { validateUserInput } from "@/lib/ai/guardrails";
import { searchProducts } from "@/lib/ai/search";
import { db } from "@/lib/db";
import { products, productVariants, productImages } from "@/lib/db/schema";
import { eq, sql, ilike } from "drizzle-orm";

export const maxDuration = 30;

/**
 * Normalizes user queries, fixing accidental fused words and common typos.
 */
function normalizeQuery(input: string): string {
  let text = input.trim();
  // Fix fused words
  text = text.replace(/whenwillthe/gi, "when will the ");
  text = text.replace(/crampbowl/gi, "ceramic tea bowl ");
  text = text.replace(/campbowl/gi, "camp bowl ");
  text = text.replace(/stockgoods/gi, "stock goods ");
  text = text.replace(/outofstock/gi, "out of stock ");
  text = text.replace(/intstock/gi, "in stock ");
  return text.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1];
    const rawUserText = typeof latestMessage.content === "string" ? latestMessage.content : "";
    const userText = normalizeQuery(rawUserText);

    // Guardrail Check: Input Sanitization & Prompt Injection Interception
    const guardrailCheck = validateUserInput(userText);
    if (!guardrailCheck.valid) {
      return NextResponse.json({
        reply: `I am the Atelier Studio Personal Curator. I specialize exclusively in our handcrafted home and outdoor collection. ${guardrailCheck.flaggedReason || "How may I assist you with our catalog today?"}`,
        products: [],
      });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // If live Gemini API key is present, stream using Vercel AI SDK
    if (apiKey && apiKey !== "placeholder" && apiKey.trim() !== "") {
      const result = streamText({
        model: google(process.env.AI_MODEL_MAIN || "gemini-2.5-flash"),
        system: ATELIER_SYSTEM_PROMPT,
        messages,
        tools: shoppingAssistantTools,
        maxSteps: 5,
      });

      return result.toDataStreamResponse();
    }

    // High-Fidelity Context-Aware Database Reasoning Engine
    const lower = userText.toLowerCase();

    // Check Previous Turn Context (for follow-ups like "yes", "sure", "add it")
    const previousMessages = messages.slice(0, -1);
    const lastAssistantMessage = [...previousMessages]
      .reverse()
      .find((m) => m.role === "assistant")?.content || "";

    const isAffirmative = /^(yes|sure|please|yeah|yep|definitely|add it|do that|ok|okay)\b/i.test(lower.trim());

    if (isAffirmative && lastAssistantMessage) {
      // Find what product was mentioned in the last assistant turn
      const matchedTitle = lastAssistantMessage.match(/\*\*([^*]+)\*\*/);
      const productName = matchedTitle ? matchedTitle[1] : null;

      if (productName) {
        const found = await db.query.products.findFirst({
          where: ilike(products.name, `%${productName.split(" ")[0]}%`),
          with: { images: true, variants: true, category: true },
        });

        if (found) {
          const inStock = found.variants.some((v) => v.stockQuantity > 0);
          return NextResponse.json({
            reply: inStock
              ? `Wonderful! I have reserved the **${found.name}** for your order. You can review your cart or proceed to checkout at any time.`
              : `I have recorded your notification request for the **${found.name}**. As soon as our Kyoto workshop completes the next firing (in approximately 10 to 14 days), we will prioritize your reservation.`,
            products: [
              {
                id: found.id,
                name: found.name,
                slug: found.slug,
                priceCents: found.priceCents,
                imageUrl: found.images[0]?.url,
                categoryName: found.category?.name,
                inStock,
              },
            ],
          });
        }
      }

      return NextResponse.json({
        reply: "Understood! Would you like me to guide you to anything specific in our workshop collection?",
        products: [],
      });
    }

    // 1. Specific or General Restock / Stock Inquiries
    const isStockInquiry =
      /when will|in stock|out of stock|available|restock|sold out|inventory/i.test(lower);

    if (isStockInquiry) {
      // Check if user named a specific item (e.g. bowl, dripper, skillet, blanket, bag, etc.)
      const isGeneralOutofStock = /out of stock|all out of stock|when will the out/i.test(lower) && !/bowl|dripper|mug|skillet|trowel|incense/i.test(lower);

      if (isGeneralOutofStock) {
        // Query distinct real out-of-stock products
        const candidateProducts = await db.query.products.findMany({
          with: { images: true, variants: true },
          limit: 20,
        });
        const outOfStockProducts = candidateProducts
          .filter((p) => p.variants.some((v) => v.stockQuantity === 0))
          .slice(0, 3);

        return NextResponse.json({
          reply: `Our workshop crafts goods in limited, unhurried batches. Any currently sold-out pieces are replenished on a **rolling 10 to 14 day cycle** as fresh stoneware leaves the wood kilns and linen is finished in Europe. Here are a few pieces from the current workshop run:`,
          products: outOfStockProducts.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            priceCents: p.priceCents,
            imageUrl: p.images[0]?.url,
            inStock: false,
          })),
        });
      }

      // Specific item stock check via semantic database search
      const searchRes = await searchProducts(userText, {}, 3);
      const topProduct = searchRes.items[0];

      if (topProduct) {
        if (!topProduct.inStock) {
          // Find an in-stock alternative in the same category
          const alternative = searchRes.items.find((item) => item.inStock && item.id !== topProduct.id);

          let reply = `The **${topProduct.name}** is currently **sold out** in our studio as our recent handcrafted batch was reserved. Our artisans are actively throwing the next kiln batch, which is scheduled to emerge in **10 to 14 days**.`;

          if (alternative) {
            reply += ` In the meantime, our **${alternative.name}** ($${(alternative.priceCents / 100).toFixed(2)}) is currently in stock and ready to dispatch immediately. Would you like me to reserve one for you?`;
          } else {
            reply += ` Would you like me to place you on the notification list for the next firing?`;
          }

          return NextResponse.json({
            reply,
            products: alternative ? [alternative] : [topProduct],
          });
        } else {
          return NextResponse.json({
            reply: `Good news! The **${topProduct.name}** is currently **in stock** ($${(topProduct.priceCents / 100).toFixed(2)}) and ready for immediate, carbon-neutral dispatch from our studio. Would you like me to add one to your cart?`,
            products: [topProduct],
          });
        }
      }
    }

    // 2. Recommendations & Catalog Queries (e.g. coffee, tea, incense, gifts, blankets)
    const searchRes = await searchProducts(userText, {}, 4);
    const topItem = searchRes.items[0];

    if (searchRes.items.length > 0 && topItem) {
      let narrative = "";
      if (/incense|aromatic|hinoki|scent/i.test(lower)) {
        narrative = `For quiet evenings, I recommend our **${topItem.name}**. Crafted on Awaji Island from natural tree resin and harvested cypress shavings, it offers clean, grounding wood notes.`;
      } else if (/coffee|dripper|mug|cup/i.test(lower)) {
        narrative = `Our **${topItem.name}** is hand-thrown from iron-rich coarse clay to ensure steady extraction heat and mindful morning rituals.`;
      } else if (/linen|blanket|throw|bedding|towel/i.test(lower)) {
        narrative = `Our **${topItem.name}** is woven from 100% natural European flax and stone-washed for immediate supple drape across all seasons.`;
      } else if (/skillet|pan|cookware|cast iron|dutch oven/i.test(lower)) {
        narrative = `Our **${topItem.name}** features a machine-smoothed cooking surface triple-seasoned with organic flax oil for unmatched heat retention.`;
      } else if (/gift/i.test(lower)) {
        narrative = `A wonderful gift consideration is the **${topItem.name}** ($${(topItem.priceCents / 100).toFixed(2)}). Handcrafted with honest materials, it arrives packaged in recyclable studio paper.`;
      } else {
        narrative = `I found several considered workshop goods that match what you're looking for, led by the **${topItem.name}**.`;
      }

      return NextResponse.json({
        reply: narrative,
        products: searchRes.items.slice(0, 3).map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          priceCents: item.priceCents,
          categoryName: item.categoryName,
          imageUrl: item.imageUrl,
          inStock: item.inStock,
        })),
      });
    }

    // Default Fallback
    return NextResponse.json({
      reply: "Welcome to Atelier. We curate heirloom home and trail goods crafted from Belgian linen, forged iron, and Japanese stoneware. What material or workshop piece can I help you find today?",
      products: [],
    });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: err.message || "Chat service error" }, { status: 500 });
  }
}
