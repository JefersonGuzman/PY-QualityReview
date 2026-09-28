import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

// Reloads the seed before the e2e run so every run starts from the same data.
export default async function globalSetup() {
  const sql = postgres(process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres", {
    onnotice: () => {},
  });
  await sql.unsafe(readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8"));
  await sql.end();
}
