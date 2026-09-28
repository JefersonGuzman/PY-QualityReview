# Sellervate Quality Review

Internal tool to review customer support replies **after** they were sent.

- **Team Leads** read replies from the brands they lead, next to that brand's own definition of a good reply, and record a score (1-5), what was wrong and written feedback.
- **Specialists** read the scores and feedback on their own replies, and nobody else's.
- Each brand gets **evidence**: the trend by week and what keeps going wrong.

It is not a helpdesk and not an AI product: scores always come from a person. Why this reading of the brief, and what was left out, is in [`DECISIONS.md`](DECISIONS.md).

---

## Run it (about 5 minutes)

Requirements: **Node.js 20+**, **npm** and **Docker Desktop running** (the local Supabase database runs in Docker).

```bash
git clone https://github.com/JefersonGuzman/PY-QualityReview.git
cd PY-QualityReview
npm install
npm run db:start      # local Supabase database: applies migrations and loads the seed
npm run dev           # http://localhost:3000
```

The first `db:start` downloads the Postgres image (a couple of minutes). Reset the data to the seed at any time with `npm run db:reset`. The app uses `postgresql://postgres:postgres@127.0.0.1:54322/postgres` by default; to point it elsewhere, copy `.env.example` to `.env.local`.

## Switch role

There is no login (stubbed on purpose). The start screen lists the demo users; **Switch user** in the header goes back to it.

| User | Role | Brands |
|---|---|---|
| Marta Vidal | Team Lead | Voltra Scooters, Lumen Home |
| Nuria Costa | Team Lead | Boxwell Packaging, Lumen Home |
| Dani Ortega | Specialist | Voltra Scooters, Boxwell Packaging |
| Leo Martin | Specialist | Voltra Scooters, Lumen Home |
| Priya Shah | Specialist | Boxwell Packaging, Lumen Home |

A two-minute tour: **Marta** → open a *Pending* Voltra reply → review it → **Dashboard**, filter *Voltra Scooters* → **Switch user** → **Dani** → *My Reviews*.

## Seed data

`supabase/seed.sql`, invented for this exercise and deterministic (fixed ids and dates): three brands that want very different replies (a scooter maker that wants diagnosis before refunds, a packaging supplier that wants three exact lines, a home decor shop that wants warmth and order-history checks), 21 replies over four weeks, 15 of them reviewed, including some obviously bad ones.

## Tests

With the database running:

```bash
npm run lint
npm run test                      # Vitest: rules, data access and brand isolation against the local database
npx playwright install chromium   # first time only
npm run test:e2e                  # Playwright: main journeys against a production build
```

## Stack

Next.js 16 (App Router) · TypeScript (strict) · Supabase (local PostgreSQL) · Tailwind CSS 4 · Vitest · Playwright.
Started from `create-next-app` (no other starter kit). Visual rules: [`DESIGN.md`](DESIGN.md). Behavior per slice: [`docs/spec.md`](docs/spec.md).

```text
app/                  routes; app/(app)/ holds the pages behind the header, app/api/ the JSON API
components/           UI built only with DESIGN.md tokens
lib/domain/           pure rules (review validation, identity cookie, types)
lib/data/             server-only data access; every query is scoped to the current user
supabase/migrations/  schema and data rules (constraints, triggers)
supabase/seed.sql     demo data
tests/                unit, database and end-to-end tests
```

## How it was built

Small branches, one pull request each, reviewed in writing on GitHub before merging. The code was written with an AI coding agent; see the AI section of `DECISIONS.md`.

## Time spent

```text
Actual implementation time: TBD
```
