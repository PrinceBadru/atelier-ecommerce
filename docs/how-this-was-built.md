# How Atelier Was Built: An Honest Agent-Assisted Engineering Workflow

Building production software with autonomous AI agents requires **engineering judgment, architectural discipline, and continuous closed-loop verification**, not blind copy-pasting.

This document transparently explains the methodology, guardrails, and verification cycles used to construct Atelier end-to-end.

---

## 1. The Operating Protocol: Spec-First, Task-by-Task

Rather than attempting a monolithic generation pass, development followed the strict principles codified in `PLAN.md` and `AGENTS.md`:

1. **Phase Isolation:** Phase $N+1$ never began until Phase $N$'s acceptance checks were fully green.
2. **Strict Verification Gates:** Static syntax check (`tsc --noEmit`), unit test validation (`vitest run`), database schema migration, and eval suite benchmarking were executed after every major module.
3. **Zero Secrets in Source:** All credentials, keys, and webhook secrets reside in `.env.local` and `.gitignore`, with clean mock fallbacks in test environments.

---

## 2. Technical Stack Choices & Trade-offs

| Domain | Solution | Why It Was Chosen |
| :--- | :--- | :--- |
| **Full-Stack Framework** | Next.js 15 (App Router) | Zero-JS React Server Components for SEO and blazing first contentful paint; API route endpoints for AI streaming. |
| **Relational & Vector DB** | PostgreSQL 16 + pgvector | Unified relational storage eliminating distributed sync lag between product stock and vector representations. |
| **ORM** | Drizzle ORM | Type-safe SQL dialect with zero runtime bloat and native vector operator support (`<=>`). |
| **AI Framework** | Vercel AI SDK (`ai`) | First-class streaming abstractions (`useChat`, `toDataStreamResponse`) and standardized Zod tool calling. |
| **Search Engine** | Reciprocal Rank Fusion (RRF) | Merges vector cosine similarity with Postgres `ts_rank` at $k=60$ to beat pure vector or pure keyword search. |
| **Styling & Tokens** | Tailwind CSS + CSS Variables | HSL CSS variables enable instantaneous theme switching and strict adherence to the Nordic Atelier design language. |

---

## 3. Human Review & Autonomous Guardrails

- **Prompt Injection Interception:** Malicious attempts to hijack system instructions, demand discounts, or extract private user data are intercepted deterministically by regex filters and prompt boundaries before reaching model execution.
- **Transactional Stock Decrement:** Stripe checkouts validate pricing on the server directly from the database and decrement variant inventory in an atomic SQL transaction to prevent double-spending or overselling.
- **Transparent Reasoning:** Every semantic search match surfaces a human-readable explanation derived from attribute overlap rather than model guesswork.
