import "server-only";
import { cookies } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { IDENTITY_COOKIE, parseIdentity } from "@/lib/domain/identity";
import type { Role, User } from "@/lib/domain/types";
import { findUser } from "./users";

// Active user of the request. The role always comes from the database, never from the client.
export async function getCurrentUser(): Promise<User | null> {
  const userId = parseIdentity((await cookies()).get(IDENTITY_COOKIE)?.value, Date.now());
  return userId ? findUser(userId) : null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/select-user");
  return user;
}

// Page-level authorization. Must run before anything streams so the 403 is real (DECISIONS.md D4).
export async function requireRole(role: Role): Promise<User> {
  const user = await requireUser();
  if (user.role !== role) forbidden();
  return user;
}
