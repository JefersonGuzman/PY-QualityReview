import "server-only";
import { sql } from "./db";
import type { ReviewStatus, User } from "@/lib/domain/types";

export type ResponseRow = {
  id: string;
  subject: string;
  sentAt: Date;
  brandId: string;
  brandName: string;
  specialistName: string;
  score: number | null; // null = pending
};

export type ReviewDetail = {
  score: number;
  feedback: string;
  reviewerId: string;
  reviewerName: string;
  createdAt: Date;
  updatedAt: Date;
  issues: { code: string; label: string; critical: boolean }[];
};

export type ResponseDetail = ResponseRow & {
  brandGuidelines: string;
  customerMessage: string;
  responseText: string;
  review: ReviewDetail | null;
};

export type ResponseFilters = { brandId?: string; status?: ReviewStatus };

// Brand isolation: a Team Lead only sees responses whose BRAND they belong to
// (not by author). Anything else behaves as if it did not exist.
export async function listResponsesForTeamLead(user: User, filters: ResponseFilters = {}): Promise<ResponseRow[]> {
  if (user.role !== "team_lead") return [];
  return sql<ResponseRow[]>`
    select r.id, r.subject, r.sent_at as "sentAt", b.id as "brandId", b.name as "brandName",
           s.name as "specialistName", rv.score
    from responses r
    join user_brands ub on ub.brand_id = r.brand_id and ub.user_id = ${user.id}
    join brands b on b.id = r.brand_id
    join users s on s.id = r.specialist_id
    left join reviews rv on rv.response_id = r.id
    where true
      ${filters.brandId ? sql`and r.brand_id = ${filters.brandId}` : sql``}
      ${filters.status === "pending" ? sql`and rv.id is null` : sql``}
      ${filters.status === "reviewed" ? sql`and rv.id is not null` : sql``}
    order by r.sent_at desc`;
}

export async function getResponseForTeamLead(user: User, responseId: string): Promise<ResponseDetail | null> {
  if (user.role !== "team_lead") return null;
  const [row] = await sql<Omit<ResponseDetail, "review">[]>`
    select r.id, r.subject, r.sent_at as "sentAt", b.id as "brandId", b.name as "brandName",
           s.name as "specialistName", rv.score,
           b.guidelines as "brandGuidelines",
           r.customer_message as "customerMessage", r.response_text as "responseText"
    from responses r
    join user_brands ub on ub.brand_id = r.brand_id and ub.user_id = ${user.id}
    join brands b on b.id = r.brand_id
    join users s on s.id = r.specialist_id
    left join reviews rv on rv.response_id = r.id
    where r.id = ${responseId}`;
  if (!row) return null;
  return { ...row, review: await getReview(row.id) };
}

// Specialist view: only their own responses, with the review when there is one.
export async function listResponsesForSpecialist(user: User): Promise<ResponseDetail[]> {
  if (user.role !== "specialist") return [];
  const rows = await sql<Omit<ResponseDetail, "review">[]>`
    select r.id, r.subject, r.sent_at as "sentAt", b.id as "brandId", b.name as "brandName",
           s.name as "specialistName", rv.score,
           b.guidelines as "brandGuidelines",
           r.customer_message as "customerMessage", r.response_text as "responseText"
    from responses r
    join brands b on b.id = r.brand_id
    join users s on s.id = r.specialist_id
    left join reviews rv on rv.response_id = r.id
    where r.specialist_id = ${user.id}
    order by r.sent_at desc`;
  return Promise.all(rows.map(async (row) => ({ ...row, review: await getReview(row.id) })));
}

async function getReview(responseId: string): Promise<ReviewDetail | null> {
  const [review] = await sql<Omit<ReviewDetail, "issues">[]>`
    select rv.score, rv.feedback, rv.reviewer_id as "reviewerId", u.name as "reviewerName",
           rv.created_at as "createdAt", rv.updated_at as "updatedAt"
    from reviews rv join users u on u.id = rv.reviewer_id
    where rv.response_id = ${responseId}`;
  if (!review) return null;
  const issues = await sql<ReviewDetail["issues"]>`
    select it.code, it.label, it.critical
    from review_issues ri
    join reviews rv on rv.id = ri.review_id
    join issue_types it on it.code = ri.issue_code
    where rv.response_id = ${responseId}
    order by it.sort_order`;
  return { ...review, issues };
}
