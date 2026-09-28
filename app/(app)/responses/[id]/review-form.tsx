"use client";

import { useActionState } from "react";
import { Button, FOCUS, InlineMessage } from "@/components/ui";
import { FEEDBACK_MAX_LENGTH, SCORE_LABELS } from "@/lib/domain/review";
import type { IssueType } from "@/lib/domain/types";
import { submitReview, type ReviewFormState } from "./actions";

type Props = {
  responseId: string;
  issueTypes: IssueType[];
  initial: { score: number; feedback: string; issueCodes: string[] } | null;
};

const LABEL = "text-[13px] leading-[18px] font-medium";
const ERROR = "text-[13px] leading-[18px] font-medium";

export function ReviewForm({ responseId, issueTypes, initial }: Props) {
  const [state, action, pending] = useActionState<ReviewFormState, FormData>(
    submitReview.bind(null, responseId),
    { status: "idle" },
  );

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <fieldset className="flex flex-col gap-2" aria-describedby={state.errors?.score ? "score-error" : undefined}>
        <legend className={`${LABEL} mb-2`}>Score</legend>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <label
              key={score}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 has-[:checked]:border-ink has-[:checked]:bg-surface-muted has-[:focus-visible]:shadow-focus"
            >
              <input
                type="radio"
                name="score"
                value={score}
                defaultChecked={initial?.score === score}
                className="accent-ink focus-visible:outline-none"
              />
              {score} · {SCORE_LABELS[score]}
            </label>
          ))}
        </div>
        {state.errors?.score && (
          <p id="score-error" className={ERROR}>
            Error: {state.errors.score}
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${LABEL} mb-2`}>Issues (optional)</legend>
        <div className="flex flex-wrap gap-2">
          {issueTypes.map((issue) => (
            <label
              key={issue.code}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 has-[:checked]:border-ink has-[:checked]:bg-surface-muted has-[:focus-visible]:shadow-focus"
            >
              <input
                type="checkbox"
                name="issues"
                value={issue.code}
                defaultChecked={initial?.issueCodes.includes(issue.code)}
                className="accent-ink focus-visible:outline-none"
              />
              {issue.critical && <span className="font-semibold">Critical ·</span>}
              {issue.label}
            </label>
          ))}
        </div>
        {state.errors?.issues && <p className={ERROR}>Error: {state.errors.issues}</p>}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="feedback" className={LABEL}>
          Feedback for the Specialist
        </label>
        <textarea
          id="feedback"
          name="feedback"
          rows={6}
          defaultValue={initial?.feedback ?? ""}
          aria-describedby="feedback-hint"
          aria-invalid={state.errors?.feedback ? true : undefined}
          className={`min-h-24 rounded-lg border border-border-strong bg-surface px-3 py-2 text-base shadow-card placeholder:text-muted aria-invalid:border-2 aria-invalid:border-ink ${FOCUS}`}
          placeholder="What went well, and what should change next time?"
        />
        <p id="feedback-hint" className="text-xs text-muted">
          Required. Up to {FEEDBACK_MAX_LENGTH} characters.
        </p>
        {state.errors?.feedback && <p className={ERROR}>Error: {state.errors.feedback}</p>}
      </div>

      {state.status === "saved" && <InlineMessage>Saved. The Specialist can now see this review.</InlineMessage>}
      {state.status === "error" && <InlineMessage>Error: {state.message}</InlineMessage>}

      <div>
        <Button type="submit" variant="primary" disabled={pending} aria-busy={pending || undefined}>
          {initial ? "Update review" : "Submit review"}
        </Button>
      </div>
    </form>
  );
}
