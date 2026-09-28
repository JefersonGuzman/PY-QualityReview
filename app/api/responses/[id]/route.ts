import { NextResponse } from "next/server";
import { getResponseForTeamLead, listResponsesForSpecialist } from "@/lib/data/responses";
import { getCurrentUser } from "@/lib/data/session";

// GET /api/responses/:id — one reply, only if the current user may read it.
// Another brand's (or another Specialist's) reply answers 404, exactly like a missing one,
// so the API does not reveal that it exists.
export async function GET(_request: Request, { params }: RouteContext<"/api/responses/[id]">) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Choose a demo user first." }, { status: 401 });

  const { id } = await params;
  const response =
    user.role === "team_lead"
      ? await getResponseForTeamLead(user, id)
      : ((await listResponsesForSpecialist(user)).find((r) => r.id === id) ?? null);

  if (!response) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ response }, { headers: { "Cache-Control": "private, no-store" } });
}
