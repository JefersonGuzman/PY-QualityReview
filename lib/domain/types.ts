// Shared domain types. Pure module: no React, Next.js or database imports.

export type Role = "team_lead" | "specialist";

export type User = {
  id: string;
  name: string;
  role: Role;
};

export const ROLE_LABELS: Record<Role, string> = {
  team_lead: "Team Lead",
  specialist: "Specialist",
};

export const ROLE_HOME: Record<Role, string> = {
  team_lead: "/responses",
  specialist: "/my-reviews",
};

export type Brand = { id: string; name: string };

export type IssueType = { code: string; label: string; critical: boolean };

export type ReviewStatus = "pending" | "reviewed";
