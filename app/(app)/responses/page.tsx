import { Suspense } from "react";
import Link from "next/link";
import { ListSkeleton } from "@/components/skeletons";
import { Card, EmptyState, FOCUS, PageTitle, Score, StatusBadge, buttonClass } from "@/components/ui";
import { listResponsesForTeamLead } from "@/lib/data/responses";
import { requireRole } from "@/lib/data/session";
import { listBrandsForUser } from "@/lib/data/users";
import { formatDate } from "@/lib/domain/format";
import type { ReviewStatus, User } from "@/lib/domain/types";

const SELECT = `h-10 rounded-lg border border-border-strong bg-surface px-3 shadow-card ${FOCUS}`;

// Team Lead: responses of their brands, filterable by brand and status.
type SearchParams = Awaited<PageProps<"/responses">["searchParams"]>;

export default async function ResponsesPage({ searchParams }: PageProps<"/responses">) {
  // Role check before anything streams, so a wrong role still gets a real 403.
  const user = await requireRole("team_lead");
  const params = await searchParams;

  return (
    <>
      <PageTitle>Responses</PageTitle>
      <p className="mt-2 text-muted">Customer support responses from your brands.</p>
      <Suspense key={JSON.stringify(params)} fallback={<ListSkeleton label="Loading responses" />}>
        <ResponsesContent user={user} params={params} />
      </Suspense>
    </>
  );
}

async function ResponsesContent({ user, params }: { user: User; params: SearchParams }) {
  const brands = await listBrandsForUser(user);

  const brandId = typeof params.brand === "string" && brands.some((b) => b.id === params.brand) ? params.brand : undefined;
  const status: ReviewStatus | undefined =
    params.status === "pending" || params.status === "reviewed" ? params.status : undefined;
  const responses = await listResponsesForTeamLead(user, { brandId, status });

  return (
    <>
      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="brand-filter" className="text-[13px] leading-[18px] font-medium">
            Brand
          </label>
          <select id="brand-filter" name="brand" defaultValue={brandId ?? ""} className={SELECT}>
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="status-filter" className="text-[13px] leading-[18px] font-medium">
            Status
          </label>
          <select id="status-filter" name="status" defaultValue={status ?? ""} className={SELECT}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
        <button type="submit" className={buttonClass("secondary")}>
          Apply filters
        </button>
      </form>

      <Card className="mt-6 p-0">
        {responses.length === 0 ? (
          <EmptyState message="No responses match these filters." />
        ) : (
          <ul aria-label="Responses" className="divide-y divide-border">
            {responses.map((response) => (
              <li key={response.id}>
                <Link
                  href={`/responses/${response.id}`}
                  className={`flex flex-col gap-2 px-5 py-4 transition-[background-color,box-shadow] duration-150 ease-out hover:bg-surface-muted sm:flex-row sm:items-center sm:justify-between ${FOCUS}`}
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{response.subject}</span>
                    <span className="block text-[13px] leading-[18px] text-muted">
                      {response.brandName} · {response.specialistName} · {formatDate(response.sentAt)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    {response.score !== null && <Score score={response.score} />}
                    <StatusBadge reviewed={response.score !== null} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
