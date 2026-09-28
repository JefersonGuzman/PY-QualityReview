# Decisions

## Product

**The real problem.** A team lead can judge a reply in seconds, but only against *that brand's* standard, and today the judgement leaves no trace: nobody can coach from it, and nobody can show a brand that quality is improving. The same paragraph is excellent for one brand and wrong for the next, so any "quality" that ignores the brand is noise.

**Reading chosen: a reviewing problem, with the evidence that falls out of it.** The product is the loop: a queue of replies from the team lead's brands, the brand's own definition of a good reply shown next to the reply, and one form for score, issues and feedback. Specialists read it back. Evidence per brand (trend by week, what keeps going wrong) comes from the same rows, as tables rather than a charting project.

**Assumptions I made.**
- The brand is the tenant. A team lead sees only the brands they lead; a specialist sees only their own replies, even inside a shared brand.
- One review per reply, editable only by the team lead who wrote it. A second opinion would be a new concept, not an overwrite.
- Issues come from the team lead's own words (wrong information, skipped procedure, did not check the order history, answered a different question, customer will write again, tone, length). "Critical" marks the ones that lose accounts; tone is annoying, wrong facts are not.
- Replies arrive from outside. There is no screen to write them; the seed stands in for the helpdesk.

**Left out, on purpose.** The coaching library (marking reviews as good/bad examples) is the next thing I would build: it reuses the same rows. "Too slow" is not an issue yet because we do not store when the customer wrote. No helpdesk import, but responses already carry `source` and `external_id`, unique per brand, so an importer can be added without a migration that rewrites data. No real login, no notifications, no per-brand rubrics.

**Where a model would earn its place.** Choosing *which* five replies to read out of hundreds: flag replies that promise refunds, contradict the brand guidelines, or skip a step the guidelines require, and put them at the top of the queue with the reason. It would never score, and never be seen by the specialist. Before trusting it: a few hundred human reviews per brand to measure whether its flags agree with the team lead, and the team lead always able to ignore it.

**What I would ask before V2.** Does the brand ever see this directly, or only through the team lead? How many replies a day per brand, and do team leads read a random sample or a chosen one? Do two team leads covering one brand need to agree on scores (calibration)? Should specialists be able to answer a review?

## Architecture

**Shape.** Next.js App Router with server components; pure rules in `lib/domain`, server-only data access in `lib/data`, Postgres on local Supabase. Pages, server actions and the JSON API call the same `lib/data` functions, so there is one place where "who may see what" lives.

**Data model.** `users` (global role), `brands` (with `guidelines`), `user_brands` (membership = access), `responses` (one brand, one specialist), `reviews` (at most one per response), `review_issues` + `issue_types`. `reviews` repeats the response's `brand_id` so composite foreign keys can guarantee that the author and the reviewer belong to that brand; triggers check roles, block deleting reviews and block changing a role that data depends on.

**Authorisation, in two layers.**
1. *Application:* every read in `lib/data` is scoped to the current user (joined through `user_brands`, or filtered by `specialist_id`). A reply of another brand answers **404** (page and API alike), so its existence is not revealed; a page for another role answers **403**. The role always comes from the database, never from the request.
2. *Database:* constraints make cross-brand or wrong-role *writes* impossible, whatever the application does.

The identity is a stubbed cookie with the user id. Real authentication would mean Supabase Auth (SSO) linked to `users`, the Supabase session instead of the cookie, connecting as the `authenticated` role instead of the owner, and Row Level Security policies keyed on `auth.uid()` as a third layer for reads.

**What breaks first as this grows.** The queue loads everything: at hundreds of replies a day it needs pagination and a "yesterday" default. The dashboard aggregates on every request, fine until tens of thousands of reviews, then it wants a materialised view. Per-brand rubrics would be an additive migration (`issue_types.brand_id`, nullable), not a rewrite.

## AI

**How I worked.** An AI coding agent (Claude Code) wrote the code, tests and first drafts of the docs; I steered it, read every pull request and reviewed it in writing before merging. A first attempt used heavy spec-driven ceremony (requirement interview, formal spec, QA pass, plan, task list, review of every task). It produced a solid foundation but spent far too much of the time budget on paperwork, so I discarded it and rebuilt this repository with small vertical slices and one reviewed pull request per slice.

**Where the agent was right, and where I overrode it.** It was right to put the data rules in the database as well as in the app, and right to answer 404 for another brand's reply. I overrode it when it planned one large pull request at the end, and when its first seed ignored the brief (two specialists, generic brands that all sounded the same).

**A session excerpt I am pleased with.** Halfway through the build the agent read the brief again and stopped before publishing anything:

> The brief changes several important things, and they need adjusting before anything is published: (1) one small branch and PR per piece of work, reviewed in writing before merging, not one big PR at the end; (2) the seed needs at least three Specialists and two Team Leads, with brands that clearly do not sound alike; (3) quality depends on the brand, so the brand's guidelines go next to the reply under review; (4) "if we ask the API directly for another brand's data, it should say no", so the isolation must be reachable and tested through an API, not only through pages.

That checkpoint is why the history below is five small pull requests instead of one.

## Status

**Finished.** User switcher; brand and role isolation in pages, JSON API and database; review loop (create, update by author, validation on the server); specialist read-back; per-brand dashboard with weekly trend, recurring issues, by specialist and recent reviews; deterministic seed; unit, database and end-to-end tests.

**Half done.** States: empty and error states are designed; there are no loading skeletons, because a `loading.tsx` around the role check would turn the real 403 into a 200. The trend is by week of sending, with no date range.

**Never touched.** Coaching library, helpdesk import, real authentication, pagination, history of review edits.

**Order I would pick it up.** Pagination and a "yesterday" queue → coaching library → review edit history → helpdesk import → real authentication with RLS.

**The one thing I would flag hardest in someone else's pull request.** The app connects to Postgres as the owner, so tenant isolation for *reads* depends on every query remembering to join `user_brands`. One forgotten join in a future query leaks another brand's replies, and no layer below would stop it. I left it because with a stubbed login there is no authenticated user for RLS to key on; with real authentication, RLS is the fix, and the isolation tests are there to catch a regression until then.
