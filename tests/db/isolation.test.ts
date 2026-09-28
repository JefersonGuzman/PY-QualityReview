import { beforeAll, describe, expect, it } from "vitest";
import {
  getResponseForTeamLead,
  listResponsesForSpecialist,
  listResponsesForTeamLead,
} from "@/lib/data/responses";
import { listBrandsForUser, listUsers } from "@/lib/data/users";
import { DANI, MARTA, NURIA, PRIYA, reseed } from "../support/db";

// Requires the local database: npm run db:start.
beforeAll(reseed);

const brandsOf = (rows: { brandName: string }[]) => new Set(rows.map((r) => r.brandName));

describe("seed", () => {
  it("has two Team Leads and three Specialists, Team Leads first", async () => {
    expect((await listUsers()).map((u) => u.id)).toEqual([
      "marta-vidal",
      "nuria-costa",
      "dani-ortega",
      "leo-martin",
      "priya-shah",
    ]);
  });
});

describe("Team Lead brand isolation", () => {
  it("lists only responses of the Team Lead's brands", async () => {
    expect(brandsOf(await listResponsesForTeamLead(MARTA))).toEqual(new Set(["Voltra Scooters", "Lumen Home"]));
    expect(brandsOf(await listResponsesForTeamLead(NURIA))).toEqual(new Set(["Boxwell Packaging", "Lumen Home"]));
  });

  it("filters by the brand of the response, not by its author", async () => {
    // Marta sees Dani's Voltra replies but never his Boxwell ones.
    const marta = await listResponsesForTeamLead(MARTA);
    expect(marta.some((r) => r.id === "vo-101")).toBe(true);
    expect(marta.some((r) => r.id.startsWith("bx-"))).toBe(false);
  });

  it("treats a response outside the Team Lead's brands exactly like a missing one", async () => {
    expect(await getResponseForTeamLead(MARTA, "bx-202")).toBeNull();
    expect(await getResponseForTeamLead(NURIA, "vo-101")).toBeNull();
    expect(await getResponseForTeamLead(MARTA, "does-not-exist")).toBeNull();
    expect(await getResponseForTeamLead(MARTA, "vo-101")).not.toBeNull();
  });

  it("filters by brand and status, and ignores a brand the Team Lead does not belong to", async () => {
    const pending = await listResponsesForTeamLead(MARTA, { brandId: "voltra", status: "pending" });
    expect(pending.map((r) => r.id)).toEqual(["vo-107"]);
    expect(await listResponsesForTeamLead(MARTA, { brandId: "boxwell" })).toEqual([]);
  });

  it("returns only the user's own brands", async () => {
    expect((await listBrandsForUser(DANI)).map((b) => b.id)).toEqual(["boxwell", "voltra"]);
  });
});

describe("Specialist isolation", () => {
  it("lists only the Specialist's own responses", async () => {
    const dani = await listResponsesForSpecialist(DANI);
    expect(dani.every((r) => r.specialistName === "Dani Ortega")).toBe(true);
    expect(dani).toHaveLength(7);
  });

  it("includes score, issues, feedback and reviewer of reviewed responses", async () => {
    const reviewed = (await listResponsesForSpecialist(PRIYA)).find((r) => r.id === "bx-203");
    expect(reviewed?.review).toMatchObject({ score: 1, reviewerName: "Nuria Costa" });
    expect(reviewed?.review?.issues.map((i) => [i.label, i.critical])).toEqual([
      ["Wrong product information", true],
      ["Did not check order history", true],
    ]);
  });

  it("gives Team Lead data access nothing to a Specialist, and vice versa", async () => {
    expect(await listResponsesForTeamLead(DANI)).toEqual([]);
    expect(await getResponseForTeamLead(DANI, "vo-101")).toBeNull();
    expect(await listResponsesForSpecialist(MARTA)).toEqual([]);
  });
});
