import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { sql } from "@/lib/data/db";
import { reseed } from "../support/db";

// Requires the local database: npm run db:start. Every test starts from the seed.
beforeEach(reseed);
afterAll(reseed);

describe("database rules", () => {
  const rejects = (query: Promise<unknown>) => expect(query).rejects.toThrow();

  it("allows at most one review per response", async () => {
    await rejects(sql`insert into reviews (response_id, brand_id, reviewer_id, score, feedback)
      values ('vo-101', 'voltra', 'marta-vidal', 3, 'Second review')`);
  });

  it("requires a Team Lead reviewer who belongs to the response's brand", async () => {
    await rejects(sql`insert into reviews (response_id, brand_id, reviewer_id, score, feedback)
      values ('vo-107', 'voltra', 'dani-ortega', 3, 'Specialist reviewer')`);
    await rejects(sql`insert into reviews (response_id, brand_id, reviewer_id, score, feedback)
      values ('vo-107', 'voltra', 'nuria-costa', 3, 'Not a member')`);
  });

  it("rejects scores outside 1-5 and empty or too long feedback", async () => {
    for (const [score, feedback] of [[0, "ok"], [6, "ok"], [3, "   "], [3, "a".repeat(2001)]] as const) {
      await rejects(sql`insert into reviews (response_id, brand_id, reviewer_id, score, feedback)
        values ('vo-107', 'voltra', 'marta-vidal', ${score}, ${feedback})`);
    }
  });

  it("requires a Specialist author who belongs to the response's brand", async () => {
    await rejects(sql`insert into responses (brand_id, specialist_id, subject, customer_message, response_text, sent_at)
      values ('voltra', 'marta-vidal', 'S', 'M', 'R', now())`);
    await rejects(sql`insert into responses (brand_id, specialist_id, subject, customer_message, response_text, sent_at)
      values ('lumen', 'dani-ortega', 'S', 'M', 'R', now())`);
  });

  it("never deletes reviews, and blocks deletes and changes that would orphan them", async () => {
    await rejects(sql`delete from reviews where id = 'rv-01'`);
    await rejects(sql`delete from user_brands where user_id = 'dani-ortega' and brand_id = 'voltra'`);
    await rejects(sql`delete from user_brands where user_id = 'marta-vidal' and brand_id = 'voltra'`);
    await rejects(sql`delete from users where id = 'marta-vidal'`);
    await rejects(sql`update users set role = 'team_lead' where id = 'dani-ortega'`);
  });

  it("rejects duplicate and unknown issues on a review", async () => {
    await rejects(sql`insert into review_issues (review_id, issue_code) values ('rv-01', 'skipped-procedure')`);
    await rejects(sql`insert into review_issues (review_id, issue_code) values ('rv-01', 'made-up')`);
  });
});
