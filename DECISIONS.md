# Architectural Decisions Log

This document records key technical, architectural, and design choices made during the development of Atelier.

---

### DEC-001: Next.js App Router with TypeScript Strict Mode
- **Decision:** Use Next.js 15+ App Router with TypeScript configured in strict mode.
- **Alternatives Considered:** Remix / React Router v7, Vite SPA with Express API backend.
- **Reason:** Provides native React Server Components (RSC) for zero-JS product detail rendering, seamless edge/serverless deployment on Vercel, and built-in streaming for the AI shopping assistant.

---

### DEC-002: PostgreSQL with pgvector and Drizzle ORM
- **Decision:** Use PostgreSQL with the `pgvector` extension accessed via Drizzle ORM.
- **Alternatives Considered:** Prisma ORM, Pinecone / Weaviate standalone vector databases.
- **Reason:** Keeping relational product data, inventory, reviews, and embeddings in a single database prevents synchronization drift, reduces operational overhead, and enables atomic hybrid search queries (combining vector distance with relational metadata filtering).

---

### DEC-003: Vercel AI SDK with Google Gemini Provider
- **Decision:** Standardize on Vercel AI SDK (`ai`) paired with Google Gemini models (`gemini-2.5-flash` / `gemini-1.5-flash` and fast flash-lite variants).
- **Alternatives Considered:** OpenAI API directly, LangChain JS.
- **Reason:** Vercel AI SDK provides first-class streaming hooks (`useChat`), standardized tool calling with Zod validation, and native support for Google Gemini's generous free-tier quotas.

---

### DEC-004: Design System Tokens in CSS Variables & Tailwind
- **Decision:** Establish a cohesive warm-minimalist aesthetic (Nordic atelier style) using custom HSL CSS variables mapped into Tailwind CSS and shadcn/ui primitives.
- **Alternatives Considered:** Unstyled Tailwind classes, Material UI, Panda CSS.
- **Reason:** CSS variables enable instant light/dark mode transitions, strict design token adherence for a designer portfolio, and clean composability with shadcn/ui accessible components.
