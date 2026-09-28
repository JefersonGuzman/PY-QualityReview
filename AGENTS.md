# AGENTS.md — Sellervate Quality Review

## Project
Internal tool: Team Leads review sent customer support responses (score 1-5, issues, feedback); Specialists read feedback on their own responses; Team Leads see a dashboard of their brands. Human review only, no AI scoring in the product. See `docs/spec.md` (behavior), `DESIGN.md` (look), `DECISIONS.md` (decisions).

## Commands
- `npm install` · `npm run db:start` (Docker must be running) · `npm run dev`
- `npm run lint` · `npm run test` · `npm run test:e2e`
- `npm run db:reset` re-applies migrations and the seed.

## Rules
- Everything in English. TypeScript strict; no `any` without a comment.
- `lib/domain/` is pure (no React, Next.js or database imports). Data access only in `lib/data/` (server-only), always scoped to the current user.
- Authorization on the server; the UI is never the protection.
- UI uses only `DESIGN.md` tokens (no hex values or raw palette classes).
- Schema changes only through new files in `supabase/migrations/`.
- Work in lean vertical slices: update `docs/spec.md` first, then code with tests of the critical rules, then a Pull Request.
- Commits: `<type>: <summary>`. Do not mention AI tools in commits or PRs.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
