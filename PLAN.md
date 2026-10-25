# AI Ecommerce Demo: End-to-End Build Plan for a Coding Agent

A phased, agent-executable plan for a UX designer moving into full web apps. Written to be dropped into the repo as `PLAN.md` and referenced from `AGENTS.md`.

---

## 0. How the agent must work
Read this section before every phase.

1. **Work one phase at a time.** Do not start phase N+1 until phase N's acceptance checks pass.
2. **Plan first, then build.** At the start of each phase, write a short plan artifact listing files to create or change. Wait for approval if a human checkpoint is marked.
3. **Verify in a real browser.** After every UI task, run the dev server, open the page with the browser tool, and capture screenshots at 390px (mobile) and 1280px (desktop). Attach them to the task walkthrough.
4. **Commit small.** One commit per task, conventional commit messages (`feat:`, `fix:`, `chore:`). Every phase ends with a tagged commit `phase-N-complete`.
5. **Never invent data or APIs.** If a required secret, key, or decision is missing, stop and ask. Do not hardcode secrets. Use `.env.local` and keep `.env.example` current.
6. **Types and tests are not optional.** TypeScript strict mode. Every server action, API route, and AI tool has a validation schema (Zod) and at least one test.
7. **Accessibility and design fidelity are acceptance criteria, not polish.** See section 4.
8. **Keep a DECISIONS.md.** Whenever you choose between options, add a three-line entry: decision, alternatives, reason. This becomes portfolio material.
9. **Do not add features outside this plan.** Propose them in `BACKLOG.md` instead.

---

## 1. Product brief

- **Name (working):** Atelier, a small online shop for considered home and outdoor goods.
- **Purpose:** A live, deployed portfolio demo that proves a designer can ship a production-quality full-stack app with meaningful AI integration.
- **Primary audience:** Hiring managers and design-engineering teams who will spend about five minutes in it.
- **What it must prove:**
  - **Design craft:** a coherent design system, excellent UX flows, accessible and responsive UI.
  - **Engineering competence:** auth, payments, a real database, tests, CI/CD, deployment.
  - **AI judgment:** grounded, useful, measured AI features, not a gimmick chatbot.
- **Users and roles:**
  - **Shopper (guest or signed in):** browses, searches, chats with the assistant, buys.
  - **Admin:** manages products and orders, uses AI to write copy, reads an AI sales summary.
- **Out of scope:** real payments, real shipping integrations, multi-currency, multi-vendor, native apps.

---

## 2. Fixed technical decisions

Do not substitute these without recording it in `DECISIONS.md`.

| Concern | Choice |
| :--- | :--- |
| **Framework** | Next.js (App Router), TypeScript strict |
| **Styling** | Tailwind CSS plus shadcn/ui components, design tokens in CSS variables |
| **Database** | Postgres on Neon with the `pgvector` extension |
| **ORM and migrations** | Drizzle ORM and drizzle-kit |
| **Auth** | Better Auth (email and password, plus Google OAuth), role field on user |
| **Payments** | Stripe Checkout in test mode, webhook for order confirmation |
| **AI SDK** | Vercel AI SDK (`ai`) with the Google provider, using a free Gemini API key from Google AI Studio |
| **Chat and generation model** | Configured by env var `AI_MODEL_MAIN` (default `gemini-2.5-flash` or `gemini-1.5-flash`) |
| **Cheap and fast model** | Env var `AI_MODEL_FAST` (default `gemini-2.5-flash-lite` or `gemini-1.5-flash-8b`) for classification, tagging, and query rewriting |
| **Embeddings** | `gemini-embedding-001` or `text-embedding-004` (truncated to 768 dimensions with `outputDimensionality`), isolated behind `lib/ai/embed.ts` so the provider can be swapped |
| **File storage** | Vercel Blob for product images |
| **Validation** | Zod |
| **Unit and integration tests** | Vitest and Testing Library |
| **End-to-end tests** | Playwright |
| **Observability** | Sentry for errors, Langfuse for AI traces |
| **Deployment** | Vercel (app), Neon (db), GitHub Actions (CI) |
| **Rate limiting** | Upstash Redis with `@upstash/ratelimit` |

---

## 3. Repository structure

```
/app
  /(shop)               # storefront routes
    page.tsx            # home
    /products           # listing, filters
    /products/[slug]    # product detail
    /cart
    /checkout
    /orders
    /account
  /(admin)/admin        # protected admin routes
  /api
    /chat               # streaming assistant endpoint
    /search             # hybrid search endpoint
    /webhooks/stripe
/components
  /ui                   # shadcn primitives
  /shop                 # ProductCard, CartDrawer, FilterBar...
  /assistant            # chat panel, message, tool-result cards
  /admin
/lib
  /db                   # drizzle schema, queries, migrations
  /ai                   # embed.ts, search.ts, tools.ts, prompts.ts, guardrails.ts
  /stripe
  /auth
  /validation           # zod schemas
/scripts                # seed, embed backfill, eval runner
/evals                  # datasets and results
/tests                  # unit, integration, e2e
/docs                   # architecture.md, screenshots, case study
AGENTS.md PLAN.md DECISIONS.md BACKLOG.md README.md
```

---

## 4. Design system and UX requirements

This is the designer's home turf, so it is the strictest part of the spec. The human supplies the design direction (see Checkpoint A). The agent implements it faithfully.

### Tokens (defined once in globals.css, used everywhere):
- **Color:** background, surface, foreground, muted, border, primary, primary-foreground, accent, success, warning, danger, each with light and dark values.
- **Type:** one display face and one text face, a modular scale (12, 14, 16, 20, 24, 32, 48, 64), line-height and tracking tokens.
- **Space:** 4px base scale. Radius: 3 sizes. Elevation: 3 shadows.
- **Motion:** durations 120, 200, 320 ms and one standard easing. Respect `prefers-reduced-motion`.

### Non-negotiable UX rules:
- **Mobile-first.** Every screen verified at 390px, 768px, and 1280px.
- **WCAG 2.2 AA:** contrast, visible focus rings, keyboard operable, correct landmarks and labels, alt text, no color-only meaning.
- **Every data-driven view has loading (skeleton), empty, error, and success states.** List them in each task and verify all four.
- **Forms:** inline validation, clear error copy, preserved input on error, disabled-while-submitting buttons.
- **Performance targets:** Lighthouse 90 or higher for performance, accessibility, and best practices on home, listing, and product pages. Images use `next/image` with correct sizes.
- **Microcopy matters:** the agent drafts, the human edits (Checkpoint C).
- **Required screens:** Home, Product listing with filters, Product detail, Cart drawer and cart page, Checkout, Order confirmation, Order history, Sign in and sign up, Account, Admin dashboard, Admin product editor, Admin orders, Assistant panel, 404 and error pages.

---

## 5. Data model

Create with Drizzle. All tables have `id` (uuid), `created_at`, and `updated_at`.

- `user`: email, name, role (`shopper` | `admin`), image.
- `category`: name, slug, parent_id.
- `product`: name, slug, description, price_cents, currency, category_id, status (`draft` | `active`), tags (`text[]`), attributes (`jsonb`: material, weather rating, size guide, etc.), embedding (`vector(768)`), embedding_text_hash.
- `product_variant`: product_id, sku, option_values (`jsonb`), price_cents_override, stock_quantity.
- `product_image`: product_id, url, alt_text, position.
- `review`: product_id, user_id (nullable for seeded), rating (1 to 5), title, body.
- `cart` and `cart_item`: user_id or session_id, variant_id, quantity.
- `order`: user_id, status (`pending` | `paid` | `fulfilled` | `cancelled`), total_cents, stripe_session_id, shipping_address (`jsonb`).
- `order_item`: order_id, variant_id, name_snapshot, price_cents_snapshot, quantity.
- `browse_event`: user_or_session, product_id, event_type (`view` | `add_to_cart` | `purchase`), created_at. Used for recommendations.
- `ai_log`: feature, model, input_tokens, output_tokens, latency_ms, cost_estimate, trace_id, created_at.

**Indexes:** HNSW index on `product.embedding` with cosine distance, GIN index on a generated `tsvector` column for keyword search, unique index on `product.slug`.

---

## 6. Phased build plan

### Phase 0: Foundations
1. Initialize the Next.js project with TypeScript strict, Tailwind, shadcn/ui, ESLint, Prettier.
2. Create the repo structure from section 3, plus `AGENTS.md`, `DECISIONS.md`, `BACKLOG.md`.
3. Add Vitest, Playwright, and a GitHub Actions workflow running lint, typecheck, unit tests, and build on every push.
4. Connect database, set up Drizzle, enable `pgvector`, run an initial migration.
5. Implement the design tokens and a `/design-system` page showing every token and component state.
6. Deploy configuration (and verify build).
**Acceptance:** CI is green. `/design-system` renders in light and dark. `npm run typecheck`, `lint`, `test`, and `build` all pass locally.
*Checkpoint A (human):* Approve the design direction and tokens.

### Phase 1: Catalog and storefront
1. Implement the full schema and migrations from section 5.
2. Build `scripts/seed.ts` to create about 150 products across 8 to 10 categories with variants, images, and 3 to 12 reviews per product.
3. Build home, listing (filters: category, price range, tags, in-stock; sort; pagination), and product detail (gallery, variants, stock state, reviews, related products).
4. Server-render listing and detail pages with proper metadata and Open Graph tags.
**Acceptance:** Listing filters update the URL and survive refresh and back navigation. All four states (loading, empty, error, success) verified on listing and detail. Responsive checks at three widths.
*Checkpoint B (imagery):* Curate product imagery set.

### Phase 2: Auth and cart
1. Better Auth with email and password and Google OAuth. Add role-based route protection for `/admin`.
2. Guest cart via session cookie, merged into the user cart on sign in.
3. Cart drawer and cart page with quantity changes, remove, stock validation, and optimistic updates.
4. Account page with profile and order history placeholder.
**Acceptance:** A guest can add to cart, sign in, and keep the cart. Non-admins hitting `/admin` are redirected. Playwright tests cover sign up, sign in, cart merge.

### Phase 3: Checkout and orders
1. Stripe Checkout session created server-side from the validated cart, never trusting client prices.
2. Stripe webhook (signature verified, idempotent) marks orders paid and decrements stock in a transaction.
3. Order confirmation page, order history, and order detail.
4. Transactional email (Resend) for order confirmation, with a designed template.
**Acceptance:** Test card `4242 4242 4242 4242` completes a purchase end to end. Stock decrements once even if the webhook fires twice. Playwright test covers the full purchase flow.
*Checkpoint C (microcopy):* Flow review & polished copy.

### Phase 4: Admin
1. Admin dashboard with key metrics (revenue, orders, low stock) and a recent orders table.
2. Product CRUD with image upload, variant editing, draft and active status.
3. Order management with status changes.
**Acceptance:** Admin can create a product that appears on the storefront after publishing. All forms validate with Zod on client and server. Tests cover permissions.

### Phase 5: AI foundation
1. Build `lib/ai/embed.ts` and a backfill script that embeds name + description + tags + attributes for every product and stores a hash so unchanged products are skipped.
2. Add a hook/trigger so editing a product re-embeds it.
3. Set up Langfuse tracing and the `ai_log` table, wrapping every model call in `lib/ai/instrument.ts` that records tokens, latency, and estimated cost.
4. Set up Upstash rate limits: per IP and per user, separate limits for chat and search.
**Acceptance:** Every product has an embedding. Traced call logged. Rate limit error handling friendly in UI.

### Phase 6: Hybrid semantic search
1. Implement `searchProducts(query, filters)` combining vector similarity and full-text rank using reciprocal rank fusion.
2. Search bar with debounced suggestions, a results page, and a visible "Understood as..." chip row showing extracted filters.
3. Query understanding with the fast model: extract structured filters from natural language into a Zod-validated object.
**Acceptance:** Natural language search returns sensible in-stock results. p95 search latency target under 800ms. Search evals pass.

### Phase 7: Shopping assistant
1. `/api/chat` streaming endpoint using AI SDK with tool calling.
2. Tools: `search_products`, `get_product`, `check_stock`, `compare_products`, `add_to_cart`, `get_order_status`. Structured Zod schemas.
3. Assistant panel UI: streaming text, tool results rendered as real product cards, suggested prompts, stop button, retry, thinking state.
4. Guardrails module: system prompt rules, input length cap, prompt-injection handling, output verification.
**Acceptance:** Assistant finds, compares, adds to cart in one conversation. Refuses off-topic requests. Playwright tests cover scripted scenarios.
*Checkpoint D (tone):* Assistant tone validation.

### Phase 8: Recommendations, reviews, admin AI
1. "Similar items" on product detail from embedding nearest neighbours.
2. "Recommended for you" on home using average embedding of recent `browse_event` items with popularity fallback.
3. Review summaries: generate pros, cons, and a one-line verdict per product, cached in DB.
4. Admin AI: draft product details from brief note, "Explain this week" sales intelligence summary.
**Acceptance:** AI-generated fields editable and clearly labeled. Summaries grounded in reviews.

### Phase 9: Quality, hardening, and release
1. Run eval suite (`/evals/results.md`).
2. Security pass: CSRF, cookie settings, auth checks, webhook verification, secrets scan, CSP headers.
3. Accessibility audit with axe in Playwright. Fix serious/critical issues.
4. Performance pass: image optimization, query caching.
5. Sentry error handling and graceful AI degradation if provider unavailable.
6. Write README, architecture diagram, and case study.
**Acceptance:** Zero axe serious/critical issues. Fresh clone runnable in under 10 minutes following README.

---

## 7. AI feature specifications

### 7.1 Hybrid semantic search
- Inputs: free-text query, optional filters.
- Pipeline: (1) fast model extracts filters as JSON validated by Zod; (2) Embed cleaned query; (3) Run vector search (top 40) and full-text search (top 40) in parallel; (4) Merge with reciprocal rank fusion (RRF); (5) Apply hard filters; (6) Return top 24 with short "why this matched" reason based on attribute overlap.
- Failure modes: fallback to full-text only if embedding fails. Fall back to raw query if filter extraction fails.
- Caching: 10 minutes for identical normalized queries.

### 7.2 Shopping assistant
- Persona: concise, warm, honest about trade-offs, never pushy.
- Grounding: state only facts returned by tools.
- Tools: structured outputs; UI renders product cards from IDs.
- Guardrails: system prompt boundaries, prompt injection resilience, out-of-stock validation.

---

## 8. Evals and testing
- Search evals (`/evals/search.jsonl`): 40 queries, hit@5 >= 0.85.
- Assistant evals (`/evals/assistant.jsonl`): 25 scenarios, target >= 90% pass.
- Summary evals: 20 products, target >= 95% supported.
- Unit, integration, and Playwright tests. `npm run eval` executes evals and writes report.

---

## 9. Seed data and assets
- 150 products across 8-10 categories.
- Realistic names, attributes, reviews, inventory states.
- High-quality curated imagery.
- Demo accounts: `demo@atelier.dev` (shopper) and `admin@atelier.dev` (admin).

---

## 10. Showcase deliverables
- README with pitch, live link, demo credentials, Mermaid architecture, setup commands, trade-offs.
- Case study (`/docs/case-study.md`).
- Demo video script (60 to 90 seconds).
- "How this was built" methodology note.

---

## 11. Environment variables
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`, `AI_EMBED_DIMENSIONS` (768), `AI_MODEL_MAIN`, `AI_MODEL_FAST`
- `BLOB_READ_WRITE_TOKEN`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `RESEND_API_KEY`, `SENTRY_DSN`, `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`
