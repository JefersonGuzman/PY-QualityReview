import Link from "next/link";
import { Card, EmptyState, FOCUS, PageTitle, Score, SectionTitle, buttonClass } from "@/components/ui";
import { getTeamLeadDashboard } from "@/lib/data/dashboard";
import { requireRole } from "@/lib/data/session";
import { listBrandsForUser } from "@/lib/data/users";
import { formatAverage, formatDate } from "@/lib/domain/format";

const TH = "bg-surface-muted px-4 py-2 text-left text-[13px] leading-[18px] font-medium";
const TD = "border-t border-border px-4 py-2";
const SELECT = `h-10 rounded-lg border border-border-strong bg-surface px-3 shadow-card ${FOCUS}`;

// Team Lead: the evidence to show a brand — trend, recurring issues, who needs coaching.
export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireRole("team_lead");
  const params = await searchParams;
  const brands = await listBrandsForUser(user);
  const brand = brands.find((b) => b.id === params.brand);
  const dashboard = await getTeamLeadDashboard(user, brand?.id);
  if (!dashboard) return null;
  const { totals, weekly, byBrand, bySpecialist, commonIssues, recentReviews } = dashboard;

  const stats = [
    { label: "Replies reviewed", value: `${totals.reviewed} of ${totals.responses}` },
    { label: "Average score", value: formatAverage(totals.averageScore) },
    { label: "Critical issues flagged", value: String(totals.critical) },
  ];
  const maxScore = 5;

  return (
    <>
      <PageTitle>{brand ? brand.name : "Dashboard"}</PageTitle>
      <p className="mt-2 text-muted">
        {brand ? "Quality evidence for this brand." : "Quality overview of all your brands."}
      </p>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="brand-filter" className="text-[13px] leading-[18px] font-medium">
            Brand
          </label>
          <select id="brand-filter" name="brand" defaultValue={brand?.id ?? ""} className={SELECT}>
            <option value="">All my brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={buttonClass("secondary")}>
          Show
        </button>
      </form>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <dt className="text-[13px] leading-[18px] font-medium text-muted">{stat.label}</dt>
            <dd className="mt-1 text-[28px] leading-9 font-semibold">{stat.value}</dd>
          </Card>
        ))}
      </dl>

      <section aria-labelledby="trend" className="mt-8">
        <SectionTitle>
          <span id="trend">Trend by week</span>
        </SectionTitle>
        <Card className="mt-3">
          {weekly.length === 0 ? (
            <EmptyState message="Weekly averages will appear once replies are reviewed." />
          ) : (
            <ol className="flex flex-col gap-3">
              {weekly.map((week) => (
                <li key={week.weekStart.toISOString()} className="grid grid-cols-[9rem_1fr_5rem] items-center gap-3">
                  <span className="text-[13px] leading-[18px] whitespace-nowrap text-muted">Week of {formatDate(week.weekStart)}</span>
                  {/* Decorative bar; the number next to it is the accessible value. */}
                  <span aria-hidden="true" className="h-2 rounded-full bg-surface-muted">
                    <span
                      className="block h-2 rounded-full bg-ink"
                      style={{ width: `${((week.averageScore ?? 0) / maxScore) * 100}%` }}
                    />
                  </span>
                  <span className="text-right font-semibold">
                    {formatAverage(week.averageScore)} <span className="font-normal text-muted">({week.reviewed})</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="common-issues">
          <SectionTitle>
            <span id="common-issues">What we keep getting wrong</span>
          </SectionTitle>
          <Card className="mt-3 p-0">
            {commonIssues.length === 0 ? (
              <EmptyState message="Issues flagged in reviews will appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {commonIssues.map((issue) => (
                  <li key={issue.label} className="flex justify-between gap-3 px-4 py-2">
                    <span>
                      {issue.critical && <span className="font-semibold">Critical · </span>}
                      {issue.label}
                    </span>
                    <span className="font-semibold">{issue.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section aria-labelledby="by-specialist">
          <SectionTitle>
            <span id="by-specialist">By specialist</span>
          </SectionTitle>
          <Card className="mt-3 overflow-x-auto p-0">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={TH}>Specialist</th>
                  <th className={TH}>Reviewed</th>
                  <th className={TH}>Average</th>
                </tr>
              </thead>
              <tbody>
                {bySpecialist.map((row) => (
                  <tr key={row.specialistName}>
                    <td className={TD}>{row.specialistName}</td>
                    <td className={TD}>{row.reviewed}</td>
                    <td className={TD}>{formatAverage(row.averageScore)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {!brand && (
          <section aria-labelledby="by-brand">
            <SectionTitle>
              <span id="by-brand">By brand</span>
            </SectionTitle>
            <Card className="mt-3 overflow-x-auto p-0">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={TH}>Brand</th>
                    <th className={TH}>Reviewed</th>
                    <th className={TH}>Average</th>
                  </tr>
                </thead>
                <tbody>
                  {byBrand.map((row) => (
                    <tr key={row.brandName}>
                      <td className={TD}>{row.brandName}</td>
                      <td className={TD}>
                        {row.reviewed} of {row.responses}
                      </td>
                      <td className={TD}>{formatAverage(row.averageScore)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        )}

        <section aria-labelledby="recent-reviews">
          <SectionTitle>
            <span id="recent-reviews">Recent reviews</span>
          </SectionTitle>
          <Card className="mt-3 p-0">
            {recentReviews.length === 0 ? (
              <EmptyState message="Reviews will appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {recentReviews.map((review) => (
                  <li key={review.responseId}>
                    <Link
                      href={`/responses/${review.responseId}`}
                      className={`flex flex-col gap-1 px-4 py-3 hover:bg-surface-muted ${FOCUS}`}
                    >
                      <span className="font-medium">{review.subject}</span>
                      <span className="text-[13px] leading-[18px] text-muted">
                        {review.brandName} · {review.specialistName} · {formatDate(review.updatedAt)}
                      </span>
                      <Score score={review.score} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>
    </>
  );
}
