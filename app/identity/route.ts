import { NextResponse, type NextRequest } from "next/server";
import { findUser } from "@/lib/data/users";
import { IDENTITY_COOKIE, IDENTITY_TTL_MS, encodeIdentity } from "@/lib/domain/identity";
import { ROLE_HOME } from "@/lib/domain/types";

// POST /identity — select a demo user (plain HTML form, 303 redirect).
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const userId = form?.get("userId");
  const user = typeof userId === "string" ? await findUser(userId) : null;

  if (!user) return NextResponse.redirect(new URL("/select-user", request.url), 303);

  const response = NextResponse.redirect(new URL(ROLE_HOME[user.role], request.url), 303);
  response.cookies.set(IDENTITY_COOKIE, encodeIdentity(user.id, Date.now()), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: IDENTITY_TTL_MS / 1000,
    secure: request.nextUrl.protocol === "https:",
  });
  return response;
}
