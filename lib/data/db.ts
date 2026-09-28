import "server-only";
import postgres from "postgres";

// Server-only connection to the Supabase Postgres database (DECISIONS.md D2).
// Default: the local Supabase stack started with `npm run db:start`.
const DEFAULT_URL = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

export const sql: postgres.Sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL ?? DEFAULT_URL, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 5,
    onnotice: () => {},
  });

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;
