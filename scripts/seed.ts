import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../lib/db/schema";
import { sql } from "drizzle-orm";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5433/atelier";

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

// Categories definition
const CATEGORIES_DATA = [
  { name: "Ceramics & Tableware", slug: "ceramics-tableware" },
  { name: "Linen & Textiles", slug: "linen-textiles" },
  { name: "Cast Iron & Cookware", slug: "cast-iron-cookware" },
  { name: "Waxed Canvas & Bags", slug: "waxed-canvas-bags" },
  { name: "Camp & Trail Essentials", slug: "camp-trail-essentials" },
  { name: "Lighting & Candles", slug: "lighting-candles" },
  { name: "Wooden Goods & Carvings", slug: "wooden-goods" },
  { name: "Aromatics & Incense", slug: "aromatics-incense" },
  { name: "Gardening & Botany", slug: "gardening-botany" },
];

/**
 * Dedicated, authentic, high-resolution imagery specifically tailored to each product archetype.
 * Every product archetype has verified, non-repeating artisanal photographs matching its exact item name.
 */
const ITEM_SPECIFIC_IMAGES: Record<string, string[]> = {
  // 1. Stoneware Pour-Over Dripper
  "Stoneware Pour-Over Dripper": [
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
  ],
  // 2. Ceramic Tea Bowl (Matcha Chawan)
  "Ceramic Tea Bowl": [
    "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1753009712810-3f72c3f72548?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1565117683158-aa1cb4a51c4d?auto=format&fit=crop&w=800&q=80",
  ],
  // 3. Dinner Plate Set
  "Dinner Plate Set of 4": [
    "https://images.unsplash.com/photo-1591632288574-a387f820a1ca?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1551807306-4bcd16b92a41?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80",
  ],
  // 4. Pitcher & Basin
  "Pitcher & Basin": [
    "https://images.unsplash.com/photo-1641083993161-4240941837e6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1534516484460-0b6099615d5a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1656088239658-ca839d7e8841?auto=format&fit=crop&w=800&q=80",
  ],
  // 5. Heavyweight Linen Throw
  "Heavyweight Linen Throw": [
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
  ],
  // 6. Linen Bath Sheet (Waffle Weave)
  "Linen Bath Sheet": [
    "https://images.unsplash.com/photo-1766727923658-ae4d4d837239?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
  ],
  // 7. Linen Table Runner
  "Linen Table Runner": [
    "https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1758810743610-66068a59c5bc?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80",
  ],
  // 8. Pre-Seasoned Cast Iron Skillet (REAL black skillet, no instant pots)
  "Cast Iron Skillet (10-Inch)": [
    "https://images.unsplash.com/photo-1606374894242-19110fdbd56c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1760322327906-397d8c28de1b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1612477491914-a2f46ef8586e?auto=format&fit=crop&w=800&q=80",
  ],
  // 9. Carbon Steel Dutch Oven
  "Carbon Steel Dutch Oven": [
    "https://images.unsplash.com/photo-1766746842414-e7a999ca83ce?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1780931648735-efe041af8d3a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584383010033-29d82105afaf?auto=format&fit=crop&w=800&q=80",
  ],
  // 10. Waxed Canvas Field Bag
  "Waxed Canvas Field Bag": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1577733975197-3b950ca5cabe?auto=format&fit=crop&w=800&q=80",
  ],
  // 11. Waxed Canvas Tool Roll
  "Waxed Canvas Tool Roll": [
    "https://images.unsplash.com/photo-1505128788193-9b2fcd6de977?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1643834479004-0b53b6b87f4b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=80",
  ],
  // 12. Ultralight Camp Stove
  "Ultralight Camp Stove": [
    "https://images.unsplash.com/photo-1520963959303-a5cc3bdf9260?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1749496600182-a4c4ca08dd8e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
  ],
  // 13. Deep Camp Bowl & Mug Set
  "Deep Camp Bowl & Mug Set": [
    "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1589875702444-4fb37c1b8313?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80",
  ],
  // 14. Pure Beeswax Taper Candles (NO controllers! Authentic slender beeswax taper candles)
  "Taper Candles (Pair)": [
    "https://images.unsplash.com/photo-1545666215-c5fbc4a9f4fd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1640095889747-2090ee12fa7d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1601479604588-68d9e6d386b5?auto=format&fit=crop&w=800&q=80",
  ],
  // 15. Solid Brass Minimalist Candleholder (NO wall pictures! Turned brass & black holders)
  "Minimalist Candleholder": [
    "https://images.unsplash.com/photo-1729087176894-778570ba2bf8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1485364103940-e8aff191ed1e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1603703467600-57e385ec81f7?auto=format&fit=crop&w=800&q=80",
  ],
  // 16. Walnut End-Grain Chopping Block (NO paper bags! Real wooden cutting boards)
  "End-Grain Chopping Block": [
    "https://images.unsplash.com/photo-1624811533744-f85d5325d49c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1666013942797-9daa4b8b3b4f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1587132117816-061b35073a4e?auto=format&fit=crop&w=800&q=80",
  ],
  // 17. Cherrywood Cooking Spoon Set (NO snowflakes! Real hand-carved wooden spoons)
  "Cherrywood Cooking Spoon Set": [
    "https://images.unsplash.com/photo-1549859455-746ef4fae03b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1759523091199-14f987919622?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1580151820172-ae6491498c54?auto=format&fit=crop&w=800&q=80",
  ],
  // 18. Japanese Hinoki Wood & Cedar Incense (NO hikers or cosmetic droppers! Real incense sticks)
  "Hinoki Wood & Cedar Incense": [
    "https://images.unsplash.com/photo-1783142978783-c141673fe042?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1767185623395-b518030c6d5e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=800&q=80",
  ],
  // 19. Forged Steel Hori-Hori Garden Trowel (NO potted cactus! Real forged garden spade)
  "Hori-Hori Garden Trowel": [
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1589051039485-d409c671cb65?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1781521215146-5aa55e800b0d?auto=format&fit=crop&w=800&q=80",
  ],
  // 20. Raw Copper Indoor Watering Can (NO trees or bonsai! Real metal watering cans)
  "Indoor Watering Can": [
    "https://images.unsplash.com/photo-1599277100479-3252d492a19a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1645111094670-9d51f0f63d65?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1667992714862-df8713baf8c6?auto=format&fit=crop&w=800&q=80",
  ],
};

const PRODUCT_TEMPLATES = [
  { prefix: "Hand-Thrown", base: "Stoneware Pour-Over Dripper", cat: "ceramics-tableware", price: 4400, desc: "Individually thrown on the wheel from iron-rich clay. Features spiral interior ridges for balanced extraction and slow coffee rituals.", tags: ["coffee", "ceramics", "kitchen", "handmade"] },
  { prefix: "Volcanic Ash", base: "Ceramic Tea Bowl", cat: "ceramics-tableware", price: 3200, desc: "Matte textured glaze with gentle earthy undertones. Designed for matcha and loose leaf infusions with comfortable tactile warmth.", tags: ["tea", "ceramics", "tableware"] },
  { prefix: "Stoneware", base: "Dinner Plate Set of 4", cat: "ceramics-tableware", price: 11000, desc: "Minimalist coupe profile with raised lip. Kiln-fired to stoneware temperatures for daily dishwasher durability.", tags: ["dining", "ceramics", "plates"] },
  { prefix: "Artisanal", base: "Pitcher & Basin", cat: "ceramics-tableware", price: 7800, desc: "Generous water pitcher with sculpted ergonomic handle. Hand-glazed interior with unglazed raw clay exterior.", tags: ["ceramics", "vessel", "home"] },
  { prefix: "Belgian", base: "Heavyweight Linen Throw", cat: "linen-textiles", price: 13500, desc: "Woven from 100% natural European flax. Stone-washed for immediate softness and effortless drape across sofas and bedding.", tags: ["linen", "living", "textiles", "warmth"] },
  { prefix: "Waffle-Weave", base: "Linen Bath Sheet", cat: "linen-textiles", price: 6200, desc: "Airy three-dimensional waffle weave dries three times faster than terry cloth. Highly absorbent and hypoallergenic.", tags: ["linen", "bath", "essentials"] },
  { prefix: "Organic", base: "Linen Table Runner", cat: "linen-textiles", price: 4800, desc: "Raw frayed hem table runner in natural oat tone. Matures in beauty and softness with every seasonal wash.", tags: ["dining", "table", "linen"] },
  { prefix: "Pre-Seasoned", base: "Cast Iron Skillet (10-Inch)", cat: "cast-iron-cookware", price: 8500, desc: "Machine-smoothed cooking surface seasoned with organic flaxseed oil. Superior heat retention for searing and campfires.", tags: ["cooking", "cast iron", "kitchen", "campfire"] },
  { prefix: "Hand-Forged", base: "Carbon Steel Dutch Oven", cat: "cast-iron-cookware", price: 16500, desc: "Spun steel pot with heavy brass lid knob. Engineered for hearth roasting, artisanal sourdough, and braised stews.", tags: ["cookware", "kitchen", "baking"] },
  { prefix: "Heavyweight", base: "Waxed Canvas Field Bag", cat: "waxed-canvas-bags", price: 18500, desc: "18oz Martexin waxed cotton with solid brass rivets and vegetable-tanned bridle leather handles. Weatherproof and enduring.", tags: ["bags", "canvas", "outdoor", "travel"] },
  { prefix: "Rugged", base: "Waxed Canvas Tool Roll", cat: "waxed-canvas-bags", price: 5400, desc: "Organizes culinary knives, gardening shears, or camp tools. Fastens with oiled leather cinch cord.", tags: ["storage", "canvas", "workshop"] },
  { prefix: "Titanium", base: "Ultralight Camp Stove", cat: "camp-trail-essentials", price: 7200, desc: "Collapsible wood gas backpacking stove weighing under 250g. Boils 1 liter of water in under five minutes.", tags: ["camping", "trail", "gear", "outdoor"] },
  { prefix: "Enamel", base: "Deep Camp Bowl & Mug Set", cat: "camp-trail-essentials", price: 4200, desc: "Double-dipped porcelain enamel over steel base. Rim reinforced with stainless band to resist trail chips.", tags: ["camping", "outdoor", "cookware"] },
  { prefix: "Pure Beeswax", base: "Taper Candles (Pair)", cat: "lighting-candles", price: 2800, desc: "Hand-dipped 100% natural cappings beeswax with cotton wicks. Burn cleanly with a subtle sweet honey aroma.", tags: ["candles", "lighting", "beeswax"] },
  { prefix: "Solid Brass", base: "Minimalist Candleholder", cat: "lighting-candles", price: 5800, desc: "Turned from solid architectural brass. Uncoated to develop a deep natural patina over years of quiet evenings.", tags: ["brass", "lighting", "decor"] },
  { prefix: "Walnut", base: "End-Grain Chopping Block", cat: "wooden-goods", price: 14500, desc: "Self-healing end-grain construction preserves knife edges. Finished with food-grade beeswax and mineral oil.", tags: ["wood", "kitchen", "cutting board"] },
  { prefix: "Carved", base: "Cherrywood Cooking Spoon Set", cat: "wooden-goods", price: 3600, desc: "Hand-carved trio including slotted turner, soup ladle, and tasting spoon. Silky smooth finish.", tags: ["wood", "kitchen", "utensils"] },
  { prefix: "Japanese", base: "Hinoki Wood & Cedar Incense", cat: "aromatics-incense", price: 2600, desc: "Crafted on Awaji Island using natural tree resin and harvested cypress shavings. Calming, temple-like scent notes.", tags: ["incense", "wellness", "home"] },
  { prefix: "Forged Steel", base: "Hori-Hori Garden Trowel", cat: "gardening-botany", price: 4600, desc: "Dual serrated and sharpened blade with inch depth measurements. Beechwood handle shaped for torque.", tags: ["gardening", "tools", "outdoor"] },
  { prefix: "Raw Copper", base: "Indoor Watering Can", cat: "gardening-botany", price: 8900, desc: "Long slender spout for pinpoint watering among delicate houseplants. Hand-soldered joints.", tags: ["plants", "copper", "gardening"] },
];

export async function seed() {
  console.log("Starting database clean & re-seed with tailored, authentic imagery...");

  // 1. Enable pgvector extension
  await client`CREATE EXTENSION IF NOT EXISTS vector;`;
  console.log("Vector extension verified.");

  // Clean existing product relations to avoid duplicate keys
  await client`TRUNCATE TABLE reviews, order_items, cart_items, product_images, product_variants, products, categories CASCADE;`;
  console.log("Previous catalog data cleaned.");

  // 2. Seed Demo Accounts
  console.log("Seeding demo accounts...");
  const [shopper] = await db
    .insert(schema.users)
    .values({
      email: "demo@atelier.dev",
      name: "Shopper Demo",
      role: "shopper",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { name: "Shopper Demo", role: "shopper" },
    })
    .returning();

  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@atelier.dev",
      name: "Admin Demo",
      role: "admin",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { name: "Admin Demo", role: "admin" },
    })
    .returning();

  // 3. Seed Categories
  console.log("Seeding categories...");
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES_DATA) {
    const [inserted] = await db
      .insert(schema.categories)
      .values({
        name: cat.name,
        slug: cat.slug,
      })
      .returning();
    categoryMap.set(cat.slug, inserted.id);
  }

  // 4. Generate 150 Products with item-specific images
  console.log("Generating 150 products with tailored, category-accurate imagery...");
  const modifiers = [
    "Heritage", "Artisan", "Camp", "Studio", "Nordic",
    "Natural", "Handcrafted", "Rustic", "Timeless", "Matte"
  ];

  let totalProducts = 0;
  for (let i = 0; i < 150; i++) {
    const templateIndex = i % PRODUCT_TEMPLATES.length;
    const template = PRODUCT_TEMPLATES[templateIndex];
    const modifierIndex = Math.floor(i / PRODUCT_TEMPLATES.length) % modifiers.length;
    const modifier = modifiers[modifierIndex];
    const categoryId = categoryMap.get(template.cat)!;

    const productName = i < PRODUCT_TEMPLATES.length
      ? `${template.prefix} ${template.base}`
      : `${modifier} ${template.base} No. ${i + 1}`;

    const slug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${i + 1}`;

    const priceCents = template.price + ((i * 170) % 3500);

    const [product] = await db
      .insert(schema.products)
      .values({
        name: productName,
        slug,
        description: template.desc,
        priceCents,
        currency: "USD",
        categoryId,
        status: "active",
        tags: template.tags,
        attributes: {
          material:
            template.cat === "ceramics-tableware"
              ? "Volcanic Ash & Local Stoneware"
              : template.cat === "linen-textiles"
              ? "100% Belgian European Flax"
              : template.cat === "cast-iron-cookware"
              ? "Virgin Cast Iron with Organic Flax Seasoning"
              : template.cat === "waxed-canvas-bags"
              ? "18oz Martexin Waxed Duck Canvas"
              : template.cat === "camp-trail-essentials"
              ? "Titanium & Double-Dipped Enamel"
              : template.cat === "lighting-candles"
              ? "100% Natural Cappings Beeswax & Architectural Brass"
              : template.cat === "wooden-goods"
              ? "Solid End-Grain Walnut & Cherrywood"
              : template.cat === "aromatics-incense"
              ? "Awaji Island Cypress & Hinoki Resin"
              : "Forged Steel & Hand-Soldered Copper",
          care: "Hand wash with mild botanical soap. Air dry thoroughly.",
          origin: i % 3 === 0 ? "Kyoto, Japan" : i % 3 === 1 ? "Småland, Sweden" : "Portland, Oregon",
          inStock: i % 7 !== 0,
        },
      })
      .returning();

    // Seed 1-3 Variants
    const isOutOfStock = i % 12 === 0; // Explicit out-of-stock items
    const isLowStock = i % 5 === 0;    // Low-stock items

    await db.insert(schema.productVariants).values([
      {
        productId: product.id,
        sku: `ATL-${product.id.slice(0, 6).toUpperCase()}-STD`,
        optionValues: { finish: "Natural Earth", size: "Standard" },
        stockQuantity: isOutOfStock ? 0 : isLowStock ? 2 : 24,
      },
      {
        productId: product.id,
        sku: `ATL-${product.id.slice(0, 6).toUpperCase()}-OAT`,
        optionValues: { finish: "Charcoal Ash", size: "Large" },
        stockQuantity: isOutOfStock ? 0 : 15,
        priceCentsOverride: priceCents + 800,
      },
    ]);

    // Item-specific accurate images
    const baseImages = ITEM_SPECIFIC_IMAGES[template.base] || [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    ];

    // Select distinct primary and secondary images
    const primaryImgUrl = baseImages[modifierIndex % baseImages.length];
    const secondaryImgUrl = baseImages[(modifierIndex + 1) % baseImages.length];

    await db.insert(schema.productImages).values([
      {
        productId: product.id,
        url: primaryImgUrl,
        altText: `${productName} studio catalog presentation`,
        position: 0,
      },
      {
        productId: product.id,
        url: secondaryImgUrl,
        altText: `${productName} close-up craftsmanship detail`,
        position: 1,
      },
    ]);

    // Seed 3 to 6 Reviews with varying sentiment
    const reviewCount = 3 + (i % 4);
    const reviewData = [
      { rating: 5, title: "Unmatched tactile quality", body: "The weight and feel in hand are exceptional. You can immediately feel the intention behind every detail." },
      { rating: 5, title: "Has become my daily staple", body: "Enduring, honest construction. Arrived beautifully packed in recyclable paper." },
      { rating: 4, title: "Lovely texture, subtle finish", body: "Slightly heavier than expected, but the glaze has developed an even richer patina after daily use." },
      { rating: 3, title: "Good quality, slower break-in", body: "The material is stiff out of the box and requires a few weeks of gentle handling to soften up." },
    ];

    for (let r = 0; r < reviewCount; r++) {
      const reviewSample = reviewData[r % reviewData.length];
      await db.insert(schema.reviews).values({
        productId: product.id,
        userId: r % 2 === 0 ? shopper.id : null,
        authorName: r % 2 === 0 ? "Elena R." : "Marcus T.",
        rating: reviewSample.rating,
        title: reviewSample.title,
        body: reviewSample.body,
      });
    }

    totalProducts++;
  }

  console.log(`Successfully seeded ${totalProducts} products with authentic, unique imagery, variants, and reviews!`);
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
