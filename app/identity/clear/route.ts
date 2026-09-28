import { NextResponse, type NextRequest } from "next/server";
import { IDENTITY_COOKIE } from "@/lib/domain/identity";

// POST /identity/clear — "Switch user".
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/select-user", request.url), 303);
  response.cookies.delete({ name: IDENTITY_COOKIE, path: "/" });
  return response;
}
