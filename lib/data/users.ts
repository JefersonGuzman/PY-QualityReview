import "server-only";
import { sql } from "./db";
import type { Brand, IssueType, User } from "@/lib/domain/types";

// Selector list: public, exposes only id, name and role. Team Leads first, then by name.
export async function listUsers(): Promise<User[]> {
  return sql<User[]>`select id, name, role from users order by role, name`;
}

export async function findUser(id: string): Promise<User | null> {
  const [user] = await sql<User[]>`select id, name, role from users where id = ${id}`;
  return user ?? null;
}

// Brands the user belongs to (never other brands).
export async function listBrandsForUser(user: User): Promise<Brand[]> {
  return sql<Brand[]>`
    select b.id, b.name
    from brands b join user_brands ub on ub.brand_id = b.id
    where ub.user_id = ${user.id}
    order by b.name`;
}

export async function listIssueTypes(): Promise<IssueType[]> {
  return sql<IssueType[]>`select code, label, critical from issue_types order by sort_order`;
}
