import { IssueTag, Score } from "@/components/ui";
import { formatDate } from "@/lib/domain/format";
import type { ReviewDetail } from "@/lib/data/responses";

// Read-only review: score, issues, feedback and who wrote it.
export function ReviewSummary({ review }: { review: ReviewDetail }) {
  return (
    <div className="flex flex-col gap-3">
      <Score score={review.score} />
      {review.issues.length > 0 ? (
        <ul aria-label="Issues" className="flex flex-wrap gap-2">
          {review.issues.map((issue) => (
            <li key={issue.code}>
              <IssueTag>
                {issue.critical && <span className="font-semibold">Critical · </span>}
                {issue.label}
              </IssueTag>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] leading-[18px] text-muted">No issues flagged.</p>
      )}
      <p className="text-base whitespace-pre-line">{review.feedback}</p>
      <p className="text-xs text-muted">
        Reviewed by {review.reviewerName} on {formatDate(review.createdAt)}
        {review.updatedAt.getTime() !== review.createdAt.getTime() && ` · updated ${formatDate(review.updatedAt)}`}
      </p>
    </div>
  );
}
