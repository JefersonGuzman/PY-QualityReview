import { describe, expect, it } from "vitest";
import { SCORE_LABELS, scoreLabel, validateReview } from "@/lib/domain/review";

const CATALOG = ["tone", "accuracy"];
const valid = { score: "4", feedback: "Clear and friendly.", issueCodes: ["tone"] };

describe("review validation", () => {
  it("accepts a score from 1 to 5, trimmed feedback and known issues", () => {
    expect(validateReview({ ...valid, feedback: "  Clear.  " }, CATALOG)).toEqual({
      ok: true,
      value: { score: 4, feedback: "Clear.", issueCodes: ["tone"] },
    });
  });

  it.each(["0", "6", "", "3.5", "abc", null])("rejects score %s", (score) => {
    const result = validateReview({ ...valid, score }, CATALOG);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.score).toBeDefined();
  });

  it("rejects empty or whitespace-only feedback", () => {
    const result = validateReview({ ...valid, feedback: "   " }, CATALOG);
    expect(result.ok === false && result.errors.feedback).toBeTruthy();
  });

  it("accepts 2000 characters of feedback and rejects 2001", () => {
    expect(validateReview({ ...valid, feedback: "a".repeat(2000) }, CATALOG).ok).toBe(true);
    expect(validateReview({ ...valid, feedback: "a".repeat(2001) }, CATALOG).ok).toBe(false);
  });

  it("allows no issues, removes duplicates and rejects unknown codes", () => {
    expect(validateReview({ ...valid, issueCodes: [] }, CATALOG).ok).toBe(true);
    const deduped = validateReview({ ...valid, issueCodes: ["tone", "tone"] }, CATALOG);
    expect(deduped.ok && deduped.value.issueCodes).toEqual(["tone"]);
    const unknown = validateReview({ ...valid, issueCodes: ["made-up"] }, CATALOG);
    expect(unknown.ok === false && unknown.errors.issues).toBeTruthy();
  });

  it("labels every score as in DESIGN.md", () => {
    expect(Object.values(SCORE_LABELS)).toEqual(["Poor", "Needs improvement", "Acceptable", "Good", "Excellent"]);
    expect(scoreLabel(3)).toBe("Acceptable");
  });
});
