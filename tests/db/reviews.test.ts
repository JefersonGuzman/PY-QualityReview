import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { getResponseForTeamLead } from "@/lib/data/responses";
import { saveReview } from "@/lib/data/reviews";
import { DANI, MARTA, NURIA, reseed } from "../support/db";

// Requires the local database: npm run db:start. Writes are undone by reseeding.
beforeEach(reseed);
afterAll(reseed);

describe("saving a review", () => {
  it("creates a review with issues for a pending response of the Team Lead's brand", async () => {
    const result = await saveReview(MARTA, "vo-107", { score: 5, feedback: "Great.", issueCodes: ["tone"] });
    expect(result).toEqual({ ok: true });
    const response = await getResponseForTeamLead(MARTA, "vo-107");
    expect(response?.review).toMatchObject({ score: 5, feedback: "Great.", reviewerId: "marta-vidal" });
    expect(response?.review?.issues.map((i) => i.code)).toEqual(["tone"]);
  });

  it("lets the author update the review and replaces its issues", async () => {
    await saveReview(MARTA, "vo-102", { score: 3, feedback: "Updated.", issueCodes: ["tone", "wrong-information"] });
    const review = (await getResponseForTeamLead(MARTA, "vo-102"))?.review;
    expect(review).toMatchObject({ score: 3, feedback: "Updated." });
    expect(review?.issues.map((i) => i.code)).toEqual(["wrong-information", "tone"]);
    expect(review!.updatedAt.getTime()).toBeGreaterThan(review!.createdAt.getTime());
  });

  it("does not let another Team Lead edit the review", async () => {
    // lu-301 was reviewed by Marta; Nuria also leads Lumen Home.
    expect(await saveReview(NURIA, "lu-301", { score: 5, feedback: "Mine now.", issueCodes: [] })).toEqual({
      ok: false,
      reason: "not-author",
    });
  });

  it("treats responses outside the Team Lead's brands, and Specialists, as not found", async () => {
    const input = { score: 4, feedback: "Nope.", issueCodes: [] };
    expect(await saveReview(MARTA, "bx-206", input)).toEqual({ ok: false, reason: "not-found" });
    expect(await saveReview(DANI, "vo-107", input)).toEqual({ ok: false, reason: "not-found" });
  });
});
