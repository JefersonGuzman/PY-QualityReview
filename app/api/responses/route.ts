import { NextResponse } from "next/server";
import { listResponsesForSpecialist, listResponsesForTeamLead } from "@/lib/data/responses";
import { getCurrentUser } from "@/lib/data/session";

// GET /api/responses — the replies the current user may read, and nothing else.
// Same data functions as the pages, so the API cannot drift from the UI's rules.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Choose a demo user first." }, { status: 401 });

  const responses =
    user.role === "team_lead" ? await listResponsesForTeamLead(user) : await listResponsesForSpecialist(user);
  return NextResponse.json({ responses }, { headers: { "Cache-Control": "private, no-store" } });
}
