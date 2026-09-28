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

## Architecture, AI and status

Added as the work lands, one pull request at a time.
