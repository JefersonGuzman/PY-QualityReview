import "server-only";
import { sql } from "./db";
import type { ReviewInput } from "@/lib/domain/review";
import type { User } from "@/lib/domain/types";

export type SaveReviewResult =
  | { ok: true }
  | { ok: false; reason: "not-found" | "not-author" };

// Creates or updates the review of a response (DECISIONS.md D5).
// - Only a Team Lead who belongs to the response's brand may review it; otherwise "not-found".
// - Only the Team Lead who created a review may edit it; otherwise "not-author".
// The database enforces the same rules again (roles, membership, score, feedback length).
export async function saveReview(user: User, responseId: string, input: ReviewInput): Promise<SaveReviewResult> {
  if (user.role !== "team_lead") return { ok: false, reason: "not-found" };

  return sql.begin(async (tx) => {
    const [response] = await tx<{ brandId: string }[]>`
      select r.brand_id as "brandId"
      from responses r
      join user_brands ub on ub.brand_id = r.brand_id and ub.user_id = ${user.id}
      where r.id = ${responseId}
      for update of r`;
    if (!response) return { ok: false, reason: "not-found" } as const;

    const [existing] = await tx<{ id: string; reviewerId: string }[]>`
      select id, reviewer_id as "reviewerId" from reviews where response_id = ${responseId}`;

    let reviewId: string;
    if (existing) {
      if (existing.reviewerId !== user.id) return { ok: false, reason: "not-author" } as const;
      await tx`
        update reviews set score = ${input.score}, feedback = ${input.feedback}, updated_at = now()
        where id = ${existing.id}`;
      reviewId = existing.id;
    } else {
      const [created] = await tx<{ id: string }[]>`
        insert into reviews (response_id, brand_id, reviewer_id, score, feedback)
        values (${responseId}, ${response.brandId}, ${user.id}, ${input.score}, ${input.feedback})
        returning id`;
      reviewId = created.id;
    }

    await tx`delete from review_issues where review_id = ${reviewId}`;
    for (const code of input.issueCodes) {
      await tx`insert into review_issues (review_id, issue_code) values (${reviewId}, ${code})`;
    }
    return { ok: true } as const;
  });
}
