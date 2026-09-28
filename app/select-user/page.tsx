import { redirect } from "next/navigation";
import { FOCUS, PageTitle, RoleBadge } from "@/components/ui";
import { getCurrentUser } from "@/lib/data/session";
import { listUsers } from "@/lib/data/users";
import { ROLE_HOME } from "@/lib/domain/types";

// Demo user selector: the users come from the database.
export default async function SelectUserPage() {
  const current = await getCurrentUser();
  if (current) redirect(ROLE_HOME[current.role]);
  const users = await listUsers();

  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <PageTitle>Choose a demo user</PageTitle>
      <p className="mt-2 text-muted">Pick who you want to use the app as.</p>

      {users.length === 0 ? (
        <p className="mt-8 text-muted">No demo users are available. Load the seed with npm run db:reset.</p>
      ) : (
        <ul aria-label="Demo users" className="mt-8 flex flex-col gap-3">
          {users.map((user) => (
            <li key={user.id}>
              <form method="post" action="/identity">
                <input type="hidden" name="userId" value={user.id} />
                <button
                  type="submit"
                  className={`flex min-h-10 w-full items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3 text-left shadow-card transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:bg-surface-muted hover:shadow-raised ${FOCUS}`}
                >
                  <span className="font-medium">{user.name}</span>
                  <RoleBadge role={user.role} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
