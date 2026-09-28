"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FOCUS } from "@/components/ui";
import type { Role } from "@/lib/domain/types";

const LINKS: Record<Role, { href: string; label: string }[]> = {
  team_lead: [{ href: "/responses", label: "Responses" }],
  specialist: [{ href: "/my-reviews", label: "My Reviews" }],
};

// DESIGN.md "Header and navigation": 40px items; the active one has weight 600, a muted fill
// and a 2px ink marker on the leading edge. A response detail keeps "Responses" active.
export function Nav({ role }: { role: Role }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main">
      <ul className="flex gap-1 md:flex-col">
        {LINKS[role].map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-10 items-center rounded-lg border-l-2 px-3 text-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:bg-surface-muted ${FOCUS} ${
                  active ? "border-ink bg-surface-muted font-semibold text-foreground" : "border-transparent text-muted"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
