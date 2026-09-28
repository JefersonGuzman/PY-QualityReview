import { NextResponse, type NextRequest } from "next/server";
import { IDENTITY_COOKIE, parseIdentity } from "@/lib/domain/identity";

// Coarse gate on every page request: without a well-formed, unexpired identity cookie
// the visitor goes to the selector. Roles are checked on the server by each page (requireRole).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // The selector, the identity routes and the JSON API (which answers 401 itself) are not redirected.
  if (pathname === "/select-user" || pathname.startsWith("/identity") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(IDENTITY_COOKIE)?.value;
  if (parseIdentity(cookie, Date.now())) return NextResponse.next();

  const response = NextResponse.redirect(new URL("/select-user", request.url));
  if (cookie) response.cookies.delete(IDENTITY_COOKIE);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
