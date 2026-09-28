import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewSummary } from "@/components/review-summary";
import { Card, FOCUS, PageTitle, SectionTitle, StatusBadge } from "@/components/ui";
import { getResponseForTeamLead } from "@/lib/data/responses";
import { requireRole } from "@/lib/data/session";
import { listIssueTypes } from "@/lib/data/users";
import { formatDate } from "@/lib/domain/format";
import { ReviewForm } from "./review-form";

// Team Lead: response detail and its review. A response outside the Team Lead's brands is a 404.
export default async function ResponseDetailPage({ params }: PageProps<"/responses/[id]">) {
  const user = await requireRole("team_lead");
  const { id } = await params;
  const response = await getResponseForTeamLead(user, id);
  if (!response) notFound();

  const issueTypes = await listIssueTypes();
  const review = response.review;
  const canEdit = !review || review.reviewerId === user.id;

  return (
    <>
      <Link href="/responses" className={`text-sm text-muted underline underline-offset-4 ${FOCUS}`}>
        Back to responses
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <PageTitle>{response.subject}</PageTitle>
        <StatusBadge reviewed={review !== null} />
      </div>
      <p className="mt-2 text-muted">
        {response.brandName} · {response.specialistName} · Sent {formatDate(response.sentAt)}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold">What good looks like for {response.brandName}</h3>
          <p className="mt-2 rounded-lg border-l-[3px] border-ink bg-surface-muted px-3 py-2">{response.brandGuidelines}</p>
          <h3 className="mt-6 text-base font-semibold">Customer message</h3>
          <p className="mt-2 text-base whitespace-pre-line">{response.customerMessage}</p>
          <h3 className="mt-6 text-base font-semibold">Response sent by {response.specialistName}</h3>
          <p className="mt-2 text-base whitespace-pre-line">{response.responseText}</p>
        </Card>

        <Card>
          <SectionTitle>{review ? "Review" : "Write a review"}</SectionTitle>
          <div className="mt-4">
            {canEdit ? (
              <ReviewForm
                responseId={response.id}
                issueTypes={issueTypes}
                initial={
                  review
                    ? { score: review.score, feedback: review.feedback, issueCodes: review.issues.map((i) => i.code) }
                    : null
                }
              />
            ) : (
              <>
                <ReviewSummary review={review} />
                <p className="mt-4 text-[13px] leading-[18px] text-muted">
                  Only {review.reviewerName} can edit this review.
                </p>
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
