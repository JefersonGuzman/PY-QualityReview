// Review rules shared by the form and the server action. Pure module.

export const SCORE_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Needs improvement",
  3: "Acceptable",
  4: "Good",
  5: "Excellent",
};

export const FEEDBACK_MAX_LENGTH = 2000;

export type ReviewInput = {
  score: number;
  feedback: string;
  issueCodes: string[];
};

export type ReviewFieldErrors = Partial<Record<"score" | "feedback" | "issues", string>>;

export type ReviewValidation =
  | { ok: true; value: ReviewInput }
  | { ok: false; errors: ReviewFieldErrors };

export function scoreLabel(score: number): string {
  return SCORE_LABELS[score] ?? "";
}

// Validates raw form values. `catalog` is the list of valid issue codes.
export function validateReview(
  raw: { score: unknown; feedback: unknown; issueCodes: unknown[] },
  catalog: readonly string[],
): ReviewValidation {
  const errors: ReviewFieldErrors = {};

  const score = typeof raw.score === "string" && /^\d$/.test(raw.score) ? Number(raw.score) : NaN;
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    errors.score = "Choose a score from 1 to 5.";
  }

  const feedback = typeof raw.feedback === "string" ? raw.feedback.trim() : "";
  if (feedback.length === 0) {
    errors.feedback = "Write feedback for the Specialist.";
  } else if ([...feedback].length > FEEDBACK_MAX_LENGTH) {
    errors.feedback = `Keep feedback under ${FEEDBACK_MAX_LENGTH} characters.`;
  }

  const issueCodes = [...new Set(raw.issueCodes.filter((code): code is string => typeof code === "string"))];
  if (issueCodes.some((code) => !catalog.includes(code))) {
    errors.issues = "Choose issues from the list.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { score, feedback, issueCodes } };
}
