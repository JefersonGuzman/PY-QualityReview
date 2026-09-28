import "server-only";
import { sql } from "./db";
import type { User } from "@/lib/domain/types";

export type Dashboard = {
  totals: { responses: number; reviewed: number; pending: number; averageScore: number | null; critical: number };
  weekly: { weekStart: Date; reviewed: number; averageScore: number | null }[];
  byBrand: { brandName: string; responses: number; reviewed: number; averageScore: number | null }[];
  bySpecialist: { specialistName: string; reviewed: number; averageScore: number | null }[];
  commonIssues: { label: string; critical: boolean; count: number }[];
  recentReviews: {
    responseId: string;
    subject: string;
    brandName: string;
    specialistName: string;
    score: number;
    updatedAt: Date;
  }[];
};

// Quality evidence for the Team Lead's brands only (same isolation rule as the responses list).
// `brandId` narrows it to one of those brands; any other brand id gives an empty scope.
export async function getTeamLeadDashboard(user: User, brandId?: string): Promise<Dashboard | null> {
  if (user.role !== "team_lead") return null;

  const scope = sql`
    select r.id, r.subject, r.brand_id, r.specialist_id, r.sent_at
    from responses r
    join user_brands ub on ub.brand_id = r.brand_id and ub.user_id = ${user.id}
    ${brandId ? sql`where r.brand_id = ${brandId}` : sql``}`;

  const [totals] = await sql<Dashboard["totals"][]>`
    select count(*)::int as responses,
           count(rv.id)::int as reviewed,
           (count(*) - count(rv.id))::int as pending,
           round(avg(rv.score), 1)::float8 as "averageScore",
           (select count(*)::int from (${scope}) s
              join reviews r2 on r2.response_id = s.id
              join review_issues ri on ri.review_id = r2.id
              join issue_types it on it.code = ri.issue_code and it.critical) as critical
    from (${scope}) r left join reviews rv on rv.response_id = r.id`;

  // Trend: average score per week in which the replies were sent (UTC, weeks start on Monday).
  const weekly = await sql<Dashboard["weekly"]>`
    select date_trunc('week', r.sent_at at time zone 'UTC') as "weekStart",
           count(rv.id)::int as reviewed,
           round(avg(rv.score), 1)::float8 as "averageScore"
    from (${scope}) r
    join reviews rv on rv.response_id = r.id
    group by 1 order by 1`;

  const byBrand = await sql<Dashboard["byBrand"]>`
    select b.name as "brandName", count(*)::int as responses, count(rv.id)::int as reviewed,
           round(avg(rv.score), 1)::float8 as "averageScore"
    from (${scope}) r
    join brands b on b.id = r.brand_id
    left join reviews rv on rv.response_id = r.id
    group by b.name order by b.name`;

  const bySpecialist = await sql<Dashboard["bySpecialist"]>`
    select s.name as "specialistName", count(rv.id)::int as reviewed,
           round(avg(rv.score), 1)::float8 as "averageScore"
    from (${scope}) r
    join users s on s.id = r.specialist_id
    left join reviews rv on rv.response_id = r.id
    group by s.name order by s.name`;

  const commonIssues = await sql<Dashboard["commonIssues"]>`
    select it.label, it.critical, count(*)::int as count
    from (${scope}) r
    join reviews rv on rv.response_id = r.id
    join review_issues ri on ri.review_id = rv.id
    join issue_types it on it.code = ri.issue_code
    group by it.label, it.critical, it.sort_order
    order by count(*) desc, it.sort_order`;

  const recentReviews = await sql<Dashboard["recentReviews"]>`
    select r.id as "responseId", r.subject, b.name as "brandName", s.name as "specialistName",
           rv.score, rv.updated_at as "updatedAt"
    from (${scope}) r
    join reviews rv on rv.response_id = r.id
    join brands b on b.id = r.brand_id
    join users s on s.id = r.specialist_id
    order by rv.updated_at desc
    limit 5`;

  return { totals, weekly, byBrand, bySpecialist, commonIssues, recentReviews };
}
