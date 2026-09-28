import type { ReactNode } from "react";
import { Nav } from "@/components/nav";
import { Button, RoleBadge } from "@/components/ui";
import type { User } from "@/lib/domain/types";

// Header + navigation for an identified user (DESIGN.md "Header and navigation").
export function AppShell({ user, children }: { user: User; children: ReactNode }) {
  return (
    <>
      <header className="h-14 border-b border-border bg-surface shadow-card">
        <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between gap-4 px-6">
          <span className="hidden text-base font-semibold whitespace-nowrap sm:inline">Sellervate Quality Review</span>
          <div className="ml-auto flex min-w-0 items-center gap-3">
            <span className="min-w-0 truncate text-sm font-medium">{user.name}</span>
            <RoleBadge role={user.role} />
            <form method="post" action="/identity/clear">
              <Button type="submit" variant="ghost">
                Switch user
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-6 px-6 py-8 md:flex-row">
        <aside className="md:w-48 md:shrink-0">
          <Nav role={user.role} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </>
  );
}
