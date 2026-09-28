# Decisions

## Product

**The real problem.** A team lead can judge a reply in seconds, but only against *that brand's* standard, and today the judgement leaves no trace: nobody can coach from it, and nobody can show a brand that quality is improving. The same paragraph can be excellent for one brand and wrong for the next.

**Reading chosen: a reviewing problem, with the evidence that falls out of it.** The product is the loop: a queue of replies from the team lead's brands, the brand's own definition of a good reply next to the reply, one form for score, issues and feedback. Specialists read it back. Evidence per brand (trend by week, what keeps going wrong) comes from the same rows, as tables rather than a charting project.

**Assumptions.** The brand is the tenant: a team lead sees only the brands they lead; a specialist sees only their own replies, even inside a shared brand. One review per reply, editable only by its author (a second opinion would be a new concept, not an overwrite). Issues come from the team lead's own words; "critical" marks the ones that lose accounts (wrong information), not the merely annoying ones (tone). Replies arrive from outside; the seed stands in for the helpdesk.

**Left out.** The coaching library (marking reviews as examples) is next: it reuses the same rows. "Too slow" needs the customer's message time, which is not stored yet. No helpdesk import, but responses carry `source` + `external_id` (unique per brand), so an importer is additive. No real login, notifications or per-brand rubrics.

**Where a model would earn its place.** Choosing *which* five replies to read out of hundreds: flag replies that promise refunds, contradict the brand guidelines or skip a required step, and put them first with the reason. It would never score and never be seen by the specialist. Before trusting it: a few hundred human reviews per brand to measure agreement, and the team lead always able to ignore it.

**Before a V2 I would ask:** does the brand ever see this directly? How many replies a day per brand, and are they sampled or chosen? Do two team leads on one brand need to agree on scores? Should specialists answer a review?

## Architecture

**Shape.** Next.js App Router with server components; pure rules in `lib/domain`, server-only data access in `lib/data`, Postgres on local Supabase. Pages, server actions and the JSON API call the same `lib/data` functions, so "who may see what" lives in one place.

**Data model.** `users` (global role), `brands` (with `guidelines`), `user_brands` (membership = access), `responses` (one brand, one specialist), `reviews` (at most one per response), `review_issues` + `issue_types`. `reviews` repeats the response's `brand_id` so composite foreign keys guarantee that author and reviewer belong to that brand; triggers check roles, block deleting reviews and lock a role once data depends on it.

**Authorisation, in two layers.** (1) *Application:* every read is scoped to the current user through `user_brands`, or by `specialist_id`. Another brand's reply answers **404** in pages and API alike, so its existence is not revealed; a page for another role answers **403**; the role always comes from the database. (2) *Database:* constraints make cross-brand or wrong-role writes impossible whatever the application does. Real authentication would mean Supabase Auth linked to `users`, its session instead of the demo cookie, connecting as the `authenticated` role, and RLS policies on `auth.uid()` as a third layer.

**What breaks first.** The queue loads everything: at hundreds of replies a day it needs pagination and a "yesterday" default. The dashboard aggregates on every request; past tens of thousands of reviews it wants a materialised view. Per-brand rubrics would be an additive migration (`issue_types.brand_id`), not a rewrite.

## AI

**How I worked.** An AI coding agent (Claude Code) wrote the code, tests and first drafts of the docs; I steered it, read every pull request and reviewed it in writing before merging. A first attempt used heavy spec-driven ceremony (requirement interview, formal spec, QA pass, plan, task list, review of every task); it spent too much of the budget on paperwork, so I discarded it and rebuilt this repository in small vertical slices, one reviewed pull request each.

**Right and overridden.** The agent was right to put the data rules in the database as well as in the app, and to answer 404 for another brand's reply. I overrode it when it planned one large pull request at the end, and when its first seed ignored the brief (two specialists, brands that all sounded the same).

**A session excerpt I am pleased with.** Halfway through the build the agent read the brief again and stopped before publishing anything:

> The brief changes several important things: (1) one small branch and PR per piece of work, reviewed in writing, not one big PR at the end; (2) the seed needs at least three Specialists and two Team Leads, with brands that clearly do not sound alike; (3) quality depends on the brand, so its guidelines go next to the reply under review; (4) "if we ask the API directly for another brand's data, it should say no", so isolation must be tested through an API, not only through pages.

That checkpoint is why the history is a series of small pull requests instead of one.

## Status

**Finished.** User switcher; brand and role isolation in pages, API and database; review loop (create, author-only update, server-side validation); specialist read-back; per-brand dashboard; designed empty, loading and error states; deterministic seed; unit, database and end-to-end tests; a recorded walkthrough.

**Half done.** The trend is by week of sending, with no date range. The response detail has no loading skeleton, because its 404 must be decided before streaming.

**Never touched.** Coaching library, helpdesk import, real authentication, pagination, review edit history.

**Order I would pick it up.** Pagination and a "yesterday" queue → coaching library → review edit history → helpdesk import → real authentication with RLS.

**The one thing I would flag hardest in someone else's PR.** The app connects to Postgres as the owner, so read isolation depends on every query remembering to join `user_brands`; one forgotten join in a future query leaks another brand's replies, and no layer below would stop it. I left it because with a stubbed login there is no authenticated user for RLS to key on. With real authentication, RLS is the fix; until then the isolation tests guard it.
