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

const CURATED_IMAGES: Record<string, string[]> = {
  "ceramics-tableware": [
    "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
  ],
  "linen-textiles": [
    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&w=800&q=80",
  ],
  "cast-iron-cookware": [
    "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=800&q=80",
  ],
  "waxed-canvas-bags": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
  ],
  "camp-trail-essentials": [
    "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80",
  ],
  "lighting-candles": [
    "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
  ],
  "wooden-goods": [
    "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
  ],
  "aromatics-incense": [
    "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80",
  ],
  "gardening-botany": [
    "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
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
  console.log("Starting database seed...");

  // 1. Enable pgvector extension
  await client`CREATE EXTENSION IF NOT EXISTS vector;`;
  console.log("Vector extension verified.");

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
      .onConflictDoUpdate({
        target: schema.categories.slug,
        set: { name: cat.name },
      })
      .returning();
    categoryMap.set(cat.slug, inserted.id);
  }

  // 4. Generate ~150 Products
  console.log("Generating 150 products across categories...");
  const modifiers = [
    "Heritage", "Artisan", "Camp", "Studio", "Nordic",
    "Natural", "Handcrafted", "Rustic", "Timeless", "Matte"
  ];

  let totalProducts = 0;
  for (let i = 0; i < 150; i++) {
    const template = PRODUCT_TEMPLATES[i % PRODUCT_TEMPLATES.length];
    const modifier = modifiers[Math.floor(i / PRODUCT_TEMPLATES.length) % modifiers.length];
    const categoryId = categoryMap.get(template.cat) || categoryMap.values().next().value!;
    
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
          material: i % 2 === 0 ? "Organic Stoneware" : "Waxed Duck Canvas & Brass",
          care: "Hand wash with mild botanical soap. Air dry thoroughly.",
          origin: i % 3 === 0 ? "Kyoto, Japan" : i % 3 === 1 ? "Småland, Sweden" : "Portland, Oregon",
          inStock: i % 7 !== 0,
        },
      })
      .returning();

    // Seed 1-3 Variants
    const isOutOfStock = i % 12 === 0; // Exercise out-of-stock edge cases
    const isLowStock = i % 5 === 0;    // Exercise low-stock edge cases

    await db.insert(schema.productVariants).values([
      {
        productId: product.id,
        sku: `ATL-${product.id.slice(0, 6).toUpperCase()}-STD`,
        optionValues: { finish: "Natural Earth", size: "Standard" },
        stockQuantity: isOutOfStock ? 0 : isLowStock ? 3 : 24,
      },
      {
        productId: product.id,
        sku: `ATL-${product.id.slice(0, 6).toUpperCase()}-OAT`,
        optionValues: { finish: "Charcoal Ash", size: "Large" },
        stockQuantity: isOutOfStock ? 0 : 15,
        priceCentsOverride: priceCents + 800,
      },
    ]);

    // Seed Curated Images
    const catImages = CURATED_IMAGES[template.cat] || CURATED_IMAGES["ceramics-tableware"];
    const imageUrl = catImages[i % catImages.length];
    await db.insert(schema.productImages).values({
      productId: product.id,
      url: imageUrl,
      altText: `${productName} staged in studio ambient lighting`,
      position: 0,
    });

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

  console.log(`Successfully seeded ${totalProducts} products with variants, images, and reviews!`);
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
