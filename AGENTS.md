# AGENTS.md — Atelier Project Operating Instructions

This file guides all AI agents working on the **Atelier** ecommerce codebase.

## 0. Non-Negotiable Core Rules
1. **Work one phase at a time.** Never start phase $N+1$ until phase $N$'s acceptance checks pass.
2. **Plan first, then build.** Before each phase, write an implementation plan artifact listing files to create or change.
3. **Verify in a real browser.** Verify all responsive breakpoints (390px mobile, 768px tablet, 1280px desktop) and take visual screenshots.
4. **Commit small.** One git commit per task with conventional commit messages (`feat:`, `fix:`, `chore:`, `test:`, `docs:`). Tag each phase completion with `phase-N-complete`.
5. **Never invent data or APIs.** Do not hardcode secrets. Always use `.env.local` and keep `.env.example` in sync.
6. **Types & tests are mandatory.** TypeScript strict mode. Every server action, API route, and AI tool must have a Zod schema and at least one unit/integration test.
7. **Accessibility & design fidelity are acceptance criteria.** WCAG 2.2 AA compliance, visible focus rings, aria-labels, semantic HTML, four states for every view (loading skeleton, empty, error, success).
8. **Document decisions.** Maintain `DECISIONS.md` with: decision, alternatives, reason for every architectural choice.
9. **Scope control.** Never add unrequested features. Propose additions in `BACKLOG.md`.

## 1. Project DNA
- **Framework:** Next.js (App Router), TypeScript (Strict)
- **Styling:** Tailwind CSS, shadcn/ui, CSS variable design tokens
- **Database:** PostgreSQL with `pgvector`
- **ORM:** Drizzle ORM + `drizzle-kit`
- **Auth:** Better Auth
- **AI Engine:** Vercel AI SDK (`ai`), Google Gemini provider
- **Testing:** Vitest, Testing Library, Playwright
- **Storage & Payments:** Vercel Blob, Stripe Checkout (test mode)

## 2. Command Runbook
- `npm run dev`: Start Next.js local server
- `npm run build`: Production Next.js build
- `npm run lint`: ESLint check
- `npm run typecheck`: `tsc --noEmit`
- `npm test`: Vitest unit & integration tests
- `npm run test:e2e`: Playwright e2e test suite
- `npm run db:generate`: Drizzle migration generator
- `npm run db:migrate`: Run Drizzle migrations
- `npm run db:seed`: Seed database with 150 items and reviews
- `npm run eval`: Run AI and semantic search eval suite
