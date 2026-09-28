# Specification

Lean specification: one short section per pull request, with testable acceptance criteria.
`DESIGN.md` defines how things look; this file defines what the product does. The reasoning behind it is in `DECISIONS.md`.

## 1 — Project setup
- Next.js App Router, TypeScript strict, Tailwind with the `DESIGN.md` tokens, local Supabase, Vitest and Playwright wired up.
- README takes a stranger from clone to running.

## 2 — Data model and seed
- Tables: `users` (global role), `brands` (with guidelines), `user_brands`, `responses`, `reviews`, `review_issues`, `issue_types`.
- The database rejects: a response whose author is not a Specialist of its brand; a review whose reviewer is not a Team Lead of the response's brand; a second review for a response; a score outside 1-5; empty feedback or feedback over 2000 characters; unknown or repeated issues; a review older than its response; deleting a review; deleting a user, brand or membership that responses or reviews depend on; changing the role of a user with responses or reviews.
- Responses carry `source` and `external_id` (unique per brand) so a helpdesk import can be added later.
- Deterministic seed: 3 brands with different guidelines, 2 Team Leads, 3 Specialists (each on two brands), 21 responses over four weeks, 15 reviewed, every score present, critical and non-critical issues.

## 3 — Identity and brand isolation
- A visitor picks a demo user; the choice lives in an HttpOnly cookie for 7 days. The role always comes from the database.
- Without an identity, pages redirect to the selector and the API answers 401.
- A Team Lead reads only responses of brands they belong to (by the brand of the response, not its author). A Specialist reads only their own responses.
- A response the user may not read answers 404, like a missing one, in pages and in `GET /api/responses/:id`. A page for another role answers 403.
- Team Lead: responses list with brand and status filters. Specialist: "My Reviews" with the review of each reviewed response.

## 4 — Review workflow
- Response detail shows the brand's "what good looks like", the customer message and the reply.
- Review form: score 1-5 with labels, zero or more issues (critical ones marked), feedback. Validated and authorised on the server; errors next to the fields; confirmation when saved.
- A review can be updated only by the Team Lead who wrote it; other Team Leads of the brand see it read-only.

## 5 — Brand dashboard
- Team Lead only, scoped to their brands, optionally one brand: replies reviewed, average score, critical issues; average by week; what keeps going wrong; by specialist; by brand; recent reviews.

## Out of scope
Real authentication; writing replies in the app; coaching library; helpdesk import; pagination; notifications; per-brand issue catalogues; review edit history; dark theme; deployment.
