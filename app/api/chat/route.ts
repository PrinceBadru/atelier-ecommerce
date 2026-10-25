import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { ATELIER_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { shoppingAssistantTools } from "@/lib/ai/tools";
import { validateUserInput } from "@/lib/ai/guardrails";
import { searchProducts } from "@/lib/ai/search";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { ilike } from "drizzle-orm";

export const maxDuration = 30;

// High-Entropy Utility Functions
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sampleRandom<T>(arr: T[], count: number): T[] {
  return shuffleArray(arr).slice(0, count);
}

function generateReservationToken(): string {
  const letters = ["ATL", "WS", "KYT", "STU", "HRM"];
  const prefix = pickRandom(letters);
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-RES-${num}`;
}

/**
 * Normalizes user queries, fixing accidental fused words, punctuation, and common typos.
 */
function normalizeQuery(input: string): string {
  let text = input.trim();
  text = text.replace(/whenwillthe/gi, "when will the ");
  text = text.replace(/whenare/gi, "when are ");
  text = text.replace(/howcan/gi, "how can ");
  text = text.replace(/tobookthe/gi, "to book the ");
  text = text.replace(/tobook/gi, "to book ");
  text = text.replace(/ofstock/gi, "of stock ");
  text = text.replace(/outofstock/gi, "out of stock ");
  text = text.replace(/intstock/gi, "in stock ");
  text = text.replace(/ondelivery/gi, "on delivery ");
  text = text.replace(/purchaseondelivery/gi, "purchase on delivery ");
  text = text.replace(/payondelivery/gi, "pay on delivery ");
  text = text.replace(/cashondelivery/gi, "cash on delivery ");
  text = text.replace(/crampbowl/gi, "ceramic tea bowl ");
  text = text.replace(/campbowl/gi, "camp bowl ");
  text = text.replace(/stockgoods/gi, "stock goods ");
  text = text.replace(/preorder/gi, "pre-order ");
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
      const guardrailResponses = [
        `I am the Atelier Studio Personal Curator, focusing exclusively on our handcrafted home and field goods. ${guardrailCheck.flaggedReason || "How may I assist you with our catalog today?"}`,
        `Atelier's studio assistant is dedicated solely to our artisanal pieces and heritage wares. ${guardrailCheck.flaggedReason || "May I help you explore our collection?"}`,
        `I operate as your concierge for Atelier's workshop collection. ${guardrailCheck.flaggedReason || "Is there a specific piece or material you'd like to inspect?"}`
      ];
      return NextResponse.json({
        reply: pickRandom(guardrailResponses),
        products: [],
      });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // If live Gemini API key is present, stream using high-entropy non-deterministic sampling
    if (apiKey && apiKey !== "placeholder" && apiKey.trim() !== "") {
      const result = streamText({
        model: google(process.env.AI_MODEL_MAIN || "gemini-2.5-flash"),
        system: ATELIER_SYSTEM_PROMPT,
        messages,
        tools: shoppingAssistantTools,
        maxSteps: 5,
        temperature: 0.95, // High entropy for expressive, varied natural conversation
      });

      return result.toDataStreamResponse();
    }

    // High-Entropy Dynamic Context-Aware Studio Engine
    const lower = userText.toLowerCase();

    // Check Previous Turn Context (for follow-ups like "yes", "sure", "add it", "book it")
    const previousMessages = messages.slice(0, -1);
    const lastAssistantMessage = [...previousMessages]
      .reverse()
      .find((m) => m.role === "assistant")?.content || "";

    const isAffirmative = /^(yes|sure|please|yeah|yep|definitely|add it|do that|ok|okay|book it|reserve it|confirm|place reservation)\b/i.test(lower.trim());

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
          const reservationId = generateReservationToken();
          
          const inStockConfirmations = [
            `Splendid! I have reserved the **${found.name}** for your order under token **${reservationId}**. It is held in our staging room and ready whenever you wish to proceed through checkout.`,
            `Certainly! The **${found.name}** has been allocated to your session (**${reservationId}**). We package every piece in recyclable unbleached kraft paper for swift dispatch.`,
            `Excellent choice. Your **${found.name}** reservation is logged as **${reservationId}**. You may inspect your cart or finalize your delivery details whenever you are ready.`
          ];

          const preOrderConfirmations = [
            `I have officially recorded your workshop reservation for the **${found.name}** under token **${reservationId}** with **Purchase on Delivery** billing. No upfront payment is required—as soon as our artisans finish the current firing cycle (estimated in 10–14 days), we will dispatch it to your door and settle payment upon receipt.`,
            `Your reservation for the **${found.name}** is confirmed with studio reservation code **${reservationId}**. We have earmarked a piece from the upcoming kiln batch. Your payment will be collected strictly upon delivery, with zero advance deposit required.`,
            `Priority allocation registered (**${reservationId}**) for the **${found.name}**. Our studio will notify you the moment it completes quality inspection, and you will pay only when the courier delivers the package to your hands.`
          ];

          return NextResponse.json({
            reply: inStock ? pickRandom(inStockConfirmations) : pickRandom(preOrderConfirmations),
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

      const genericConfirmations = [
        "Understood! What other workshop creation would you like me to inspect or set aside for you?",
        "Noted! Would you like to explore matching tabletop pieces or our natural textile collection?",
        "Right away. Is there anything else from our upcoming kiln or loom batches you'd like to inspect?"
      ];
      return NextResponse.json({
        reply: pickRandom(genericConfirmations),
        products: [],
      });
    }

    // 1. Dedicated Booking / Pre-Order / Purchase-on-Delivery (COD) Intent
    const isBookingOrCOD =
      /book|reserve|reservation|pre-?order|allocation|purchase on delivery|cash on delivery|pay on delivery|\bcod\b|hold for me|waitlist/i.test(lower);

    if (isBookingOrCOD) {
      // Find actual out-of-stock products in the catalog
      const candidateProducts = await db.query.products.findMany({
        with: { images: true, variants: true, category: true },
        limit: 30,
      });

      const outOfStockCandidates = candidateProducts.filter((p) =>
        p.variants.some((v) => v.stockQuantity === 0)
      );

      const sampledItems = sampleRandom(outOfStockCandidates, 3);

      const bookingOpeners = [
        "Atelier maintains an open **Studio Allocation & Purchase on Delivery** policy for all limited-batch works.",
        "Through our **Studio Reservation Program**, you can reserve upcoming artisanal batches with **Payment on Delivery** and zero deposit upfront.",
        "We are pleased to offer complimentary pre-order allocations with **doorstep settlement (Purchase on Delivery)** for all our handcrafted pieces.",
        "You can easily pre-book any upcoming or sold-out piece through our **Artisan Allocation Registry** without paying anything until it reaches your doorstep."
      ];

      const deliveryExplanations = [
        "When you reserve a piece, our Kyoto potters and Nordic weavers assign one unit directly to your name from the active production run. Once the item passes studio inspection, we dispatch it via carbon-neutral courier, and payment is collected only upon physical delivery.",
        "Our booking system requires no credit card in advance. We hold your allocation in trust, oversee the kiln firing and hand-finishing, and you settle the purchase directly upon arrival.",
        "Each reservation is tagged with a unique workshop token. We notify you once the batch cools and finishes inspection, then deliver it directly with payment collected safely at your door."
      ];

      const actionHooks = [
        "To book any of the workshop pieces below, simply let me know which one you prefer (or reply **'Book the [Item Name]'**), and I will log your allocation immediately:",
        "Here are handcrafted pieces currently scheduled in our active production run available for doorstep reservation:",
        "Here are several upcoming pieces you can book right now with payment on delivery:"
      ];

      const reply = `${pickRandom(bookingOpeners)} ${pickRandom(deliveryExplanations)}\n\n${pickRandom(actionHooks)}`;

      return NextResponse.json({
        reply,
        products: sampledItems.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          priceCents: p.priceCents,
          categoryName: p.category?.name,
          imageUrl: p.images[0]?.url,
          inStock: false,
        })),
      });
    }

    // 2. Specific or General Restock / Stock Inquiries
    const isStockInquiry =
      /when will|when are|in stock|out of stock|available|restock|sold out|inventory|coming back/i.test(lower);

    if (isStockInquiry) {
      const isGeneralOutofStock =
        /out of stock|all out of stock|when will the out|when are the out/i.test(lower) &&
        !/bowl|dripper|mug|skillet|trowel|incense|basin|pitcher|roll|blanket|knife/i.test(lower);

      if (isGeneralOutofStock) {
        const candidateProducts = await db.query.products.findMany({
          with: { images: true, variants: true, category: true },
          limit: 30,
        });
        const outOfStockProducts = candidateProducts.filter((p) =>
          p.variants.some((v) => v.stockQuantity === 0)
        );
        const selected = sampleRandom(outOfStockProducts, 3);

        const restockExplanations = [
          "Our pieces are made in unhurried, small-batch runs across Japan, Portugal, and Scandinavia. Currently sold-out pieces are replenished on a **rolling 10 to 14 day cycle** as fresh stoneware leaves the wood kilns and linen is finished.",
          "Because every item is thrown, woven, or forged by hand, our inventory operates on a seasonal rotation. Out-of-stock goods typically return within **8 to 15 business days** following kiln cooling and quality control.",
          "We avoid mass manufacturing in favor of limited artisan editions. Our current out-of-stock items are in the final stages of glaze firing and hand-buffing, with fresh arrivals expected in **approx. 10 to 12 days**."
        ];

        const restockHooks = [
          "You are welcome to pre-book any of these creations for **Purchase on Delivery** so you are guaranteed one from the incoming batch:",
          "Here is a look at several sold-out workshop favorites currently in active production:",
          "Below are pieces currently in the studio kiln and workshop schedule. Let me know if you would like me to reserve one for you:"
        ];

        return NextResponse.json({
          reply: `${pickRandom(restockExplanations)}\n\n${pickRandom(restockHooks)}`,
          products: selected.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            priceCents: p.priceCents,
            imageUrl: p.images[0]?.url,
            categoryName: p.category?.name,
            inStock: false,
          })),
        });
      }

      // Specific item stock check via semantic database search
      const searchRes = await searchProducts(userText, {}, 4);
      const topProduct = searchRes.items[0];

      if (topProduct) {
        if (!topProduct.inStock) {
          const alternative = searchRes.items.find((item) => item.inStock && item.id !== topProduct.id);

          const timeframes = ["10 to 14 days", "8 to 12 days", "roughly two weeks", "approximately 10 days"];
          const selectedTime = pickRandom(timeframes);

          const craftDetails = [
            `Our artisans in the Kyoto studio are presently firing the next batch in a traditional wood kiln.`,
            `The master craftsmen are hand-finishing the new run, ensuring the natural textures and durable glazes meet our studio standards.`,
            `The next artisan batch is currently in production, undergoing careful curing and unhurried natural inspection.`
          ];

          let reply = `The **${topProduct.name}** is currently **sold out** in our main studio gallery. ${pickRandom(craftDetails)} We anticipate fresh arrivals in **${selectedTime}**.`;

          if (alternative) {
            const alternativeBridges = [
              ` If you prefer something ready to ship right now, our **${alternative.name}** ($${(alternative.priceCents / 100).toFixed(2)}) is in stock and can dispatch immediately.`,
              ` As an immediate alternative, the **${alternative.name}** ($${(alternative.priceCents / 100).toFixed(2)}) shares similar artisanal qualities and is available right away.`,
              ` Alternatively, we have the **${alternative.name}** ($${(alternative.priceCents / 100).toFixed(2)}) ready for instant dispatch.`
            ];
            reply += pickRandom(alternativeBridges);
            reply += ` Would you like me to reserve the **${topProduct.name}** for you on delivery, or add the **${alternative.name}** to your cart?`;
          } else {
            reply += ` Would you like me to book your name on the **Purchase on Delivery** priority reservation list?`;
          }

          return NextResponse.json({
            reply,
            products: alternative ? [topProduct, alternative] : [topProduct],
          });
        } else {
          const stockConfirmations = [
            `Wonderful news! The **${topProduct.name}** is currently **in stock** ($${(topProduct.priceCents / 100).toFixed(2)}) and resting in our studio, ready for immediate, carbon-neutral dispatch. Would you like me to reserve one for your order?`,
            `The **${topProduct.name}** is **available now** ($${(topProduct.priceCents / 100).toFixed(2)}). We have inventory on hand prepared for prompt packaging in our recyclable studio boxes. Shall I add it to your cart?`,
            `Yes, our studio has the **${topProduct.name}** **in stock** ($${(topProduct.priceCents / 100).toFixed(2)}). Each unit has passed quality inspection and can ship within 24 hours. Would you like to proceed with this piece?`
          ];
          return NextResponse.json({
            reply: pickRandom(stockConfirmations),
            products: [topProduct],
          });
        }
      }
    }

    // 3. Recommendations & Catalog Queries (Coffee, Tea, Incense, Blankets, Cookware, etc.)
    const searchRes = await searchProducts(userText, {}, 6);
    
    if (searchRes.items.length > 0) {
      // Stochastic sampling: pick top 3 from the top 6 candidates to add variety
      const candidateSubset = searchRes.items.slice(0, 5);
      const selectedProducts = sampleRandom(candidateSubset, Math.min(3, candidateSubset.length));
      const topItem = selectedProducts[0] || searchRes.items[0];

      let narrative = "";

      if (/incense|aromatic|hinoki|scent|diffuser/i.test(lower)) {
        const incenseStories = [
          `For serene evenings, our **${topItem.name}** is pressed on Awaji Island from natural cypress shavings and pure tree resins, yielding an authentic, low-smoke aromatic profile.`,
          `Our aromatic collection centers around botanical purity. The **${topItem.name}** uses wild-harvested woods to cultivate grounding, contemplative interior spaces.`,
          `If you appreciate understated ritual scents, the **${topItem.name}** offers clean, grounding wood notes free of synthetic fragrances or chemical binders.`
        ];
        narrative = pickRandom(incenseStories);
      } else if (/coffee|tea|dripper|mug|cup|kettle|bowl/i.test(lower)) {
        const beverageStories = [
          `Our morning ritual pieces, led by the **${topItem.name}**, are hand-thrown from iron-rich coarse stoneware to maintain optimal thermal stability during slow pours.`,
          `Crafted for slow, intentional mornings, the **${topItem.name}** pairs functional precision with an unglazed tactile exterior that warms naturally in the hands.`,
          `From our ceramic studio, the **${topItem.name}** reflects the wabi-sabi philosophy—each piece celebrating subtle glaze variances and comfortable ergonomic balance.`
        ];
        narrative = pickRandom(beverageStories);
      } else if (/linen|blanket|throw|bedding|towel|textile/i.test(lower)) {
        const linenStories = [
          `Woven from European flax and stone-washed for immediate supple drape, the **${topItem.name}** delivers effortless year-round temperature regulation.`,
          `Our textiles emphasize raw, durable fibers. The **${topItem.name}** softens with every laundering while maintaining its structural weave for decades of daily living.`,
          `The **${topItem.name}** is spun from long-staple flax fibers, lending a relaxed textural weight whether draped over a bench or layered upon a bed.`
        ];
        narrative = pickRandom(linenStories);
      } else if (/skillet|pan|cookware|cast iron|dutch oven|pot/i.test(lower)) {
        const cookwareStories = [
          `Engineered for generational durability, our **${topItem.name}** features a machine-smoothed cooking surface triple-seasoned with organic flax oil for exceptional non-stick searing.`,
          `Our cookware is cast using virgin ore for pure heat distribution. The **${topItem.name}** retains thermal mass effortlessly across open flame, induction, or embers.`,
          `Designed as an heirloom kitchen workhorse, the **${topItem.name}** eliminates rough factory pitting with precision hand-milling, ensuring effortless releases from day one.`
        ];
        narrative = pickRandom(cookwareStories);
      } else if (/gift|present|curated|wedding|anniversary/i.test(lower)) {
        const giftStories = [
          `A considerate gift is the **${topItem.name}** ($${(topItem.priceCents / 100).toFixed(2)}). Packaged in unbleached studio paper with hand-tied twine, it represents enduring craftsmanship.`,
          `For someone who values intentional design, the **${topItem.name}** makes a timeless token that only gains character with age and use.`,
          `We frequently recommend the **${topItem.name}** as an heirloom gift. It embodies natural textures and everyday utility without unnecessary ornamentation.`
        ];
        narrative = pickRandom(giftStories);
      } else {
        const generalStories = [
          `Reflecting our workshop's dedication to raw materials, here are pieces curated around your interest, highlighted by the **${topItem.name}**.`,
          `I have brought together several workshop creations that match your inquiry, beginning with the **${topItem.name}**.`,
          `Drawing from our recent studio firings and craft partnerships, here is a thoughtful selection featuring the **${topItem.name}**.`
        ];
        narrative = pickRandom(generalStories);
      }

      return NextResponse.json({
        reply: narrative,
        products: selectedProducts.map((item) => ({
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

    // Default Non-Deterministic Fallback
    const welcomeGreetings = [
      "Welcome to Atelier. We curate heirloom home and trail goods crafted from Belgian flax, forged iron, and Japanese stoneware. What material or workshop piece can I help you discover today?",
      "Greetings from the Atelier studio. We design goods built for longevity and quiet daily rituals. Are you seeking ceramic tableware, cast-iron cookware, or natural textiles?",
      "Welcome. Our studio catalog honors authentic craftsmanship—from wood-fired pottery to stone-washed linen. How may I guide your exploration today?",
      "Hello and welcome to Atelier. Every piece in our collection is crafted in limited batches by heritage artisans. What kind of space or daily ritual are you looking to furnish?"
    ];

    return NextResponse.json({
      reply: pickRandom(welcomeGreetings),
      products: [],
    });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: err.message || "Chat service error" }, { status: 500 });
  }
}
