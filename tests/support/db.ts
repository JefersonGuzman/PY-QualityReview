import { readFileSync } from "node:fs";
import { sql } from "@/lib/data/db";
import type { User } from "@/lib/domain/types";

// Reloads supabase/seed.sql (it truncates first), so every test file starts from the same data.
export async function reseed(): Promise<void> {
  await sql.unsafe(readFileSync(new URL("../../supabase/seed.sql", import.meta.url), "utf8"));
}

export const MARTA: User = { id: "marta-vidal", name: "Marta Vidal", role: "team_lead" }; // Voltra, Lumen
export const NURIA: User = { id: "nuria-costa", name: "Nuria Costa", role: "team_lead" }; // Boxwell, Lumen
export const DANI: User = { id: "dani-ortega", name: "Dani Ortega", role: "specialist" }; // Voltra, Boxwell
export const LEO: User = { id: "leo-martin", name: "Leo Martin", role: "specialist" }; // Voltra, Lumen
export const PRIYA: User = { id: "priya-shah", name: "Priya Shah", role: "specialist" }; // Boxwell, Lumen
