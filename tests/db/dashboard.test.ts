import { beforeAll, describe, expect, it } from "vitest";
import { getTeamLeadDashboard } from "@/lib/data/dashboard";
import { DANI, MARTA, reseed } from "../support/db";

// Requires the local database: npm run db:start.
beforeAll(reseed);

describe("dashboard", () => {
  it("scopes the dashboard to the Team Lead's brands", async () => {
    const all = await getTeamLeadDashboard(MARTA);
    expect(all?.totals).toMatchObject({ responses: 14, reviewed: 10, pending: 4 });
    expect(all?.byBrand.map((b) => b.brandName)).toEqual(["Lumen Home", "Voltra Scooters"]);

    const voltra = await getTeamLeadDashboard(MARTA, "voltra");
    expect(voltra?.totals).toMatchObject({ responses: 7, reviewed: 6, averageScore: 3.5, critical: 3 });
    expect(voltra?.weekly.map((w) => w.averageScore)).toEqual([3.5, 2.5, 4, 5]);

    const foreign = await getTeamLeadDashboard(MARTA, "boxwell");
    expect(foreign?.totals).toMatchObject({ responses: 0, reviewed: 0 });
  });

  it("gives nothing to a Specialist", async () => {
    expect(await getTeamLeadDashboard(DANI)).toBeNull();
  });
});
