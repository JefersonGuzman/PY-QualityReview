import { Suspense } from "react";
import { ReviewSummary } from "@/components/review-summary";
import { CardsSkeleton } from "@/components/skeletons";
import { Card, EmptyState, FOCUS, PageTitle, StatusBadge } from "@/components/ui";
import { listResponsesForSpecialist } from "@/lib/data/responses";
import { requireRole } from "@/lib/data/session";
import { formatDate } from "@/lib/domain/format";
import type { User } from "@/lib/domain/types";

// Specialist: only their own responses and the feedback they received.
export default async function MyReviewsPage() {
  // Role check before anything streams, so a wrong role still gets a real 403.
  const user = await requireRole("specialist");

  return (
    <>
      <PageTitle>My Reviews</PageTitle>
      <Suspense fallback={<CardsSkeleton label="Loading your reviews" />}>
        <MyReviewsContent user={user} />
      </Suspense>
    </>
  );
}

async function MyReviewsContent({ user }: { user: User }) {
  const responses = await listResponsesForSpecialist(user);
  const reviewed = responses.filter((response) => response.review !== null).length;

  return (
    <>
      <p className="mt-2 text-muted">
        {reviewed} of {responses.length} of your responses have been reviewed.
      </p>

      {responses.length === 0 ? (
        <Card className="mt-6 p-0">
          <EmptyState message="Reviews of your responses will appear here." />
        </Card>
      ) : (
        <ul aria-label="My responses" className="mt-6 flex flex-col gap-4">
          {responses.map((response) => (
            <li key={response.id}>
              <Card>
                <article aria-label={response.subject}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold">{response.subject}</h3>
                      <p className="text-[13px] leading-[18px] text-muted">
                        {response.brandName} · Sent {formatDate(response.sentAt)}
                      </p>
                    </div>
                    <StatusBadge reviewed={response.review !== null} />
                  </div>
                  <details className="mt-3">
                    <summary className={`cursor-pointer rounded text-sm text-muted ${FOCUS}`}>Show the conversation</summary>
                    <p className="mt-2 text-sm font-medium">Customer</p>
                    <p className="whitespace-pre-line">{response.customerMessage}</p>
                    <p className="mt-2 text-sm font-medium">Your response</p>
                    <p className="whitespace-pre-line">{response.responseText}</p>
                  </details>
                  <div className="mt-4 border-t border-border pt-4">
                    {response.review ? (
                      <ReviewSummary review={response.review} />
                    ) : (
                      <p className="text-muted">Not reviewed yet.</p>
                    )}
                  </div>
                </article>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
