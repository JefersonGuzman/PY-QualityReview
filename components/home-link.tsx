import Link from "next/link";
import { FOCUS } from "@/components/ui";
import { getCurrentUser } from "@/lib/data/session";
import { ROLE_HOME } from "@/lib/domain/types";

const HOME_LABEL = { team_lead: "Go to Responses", specialist: "Go to My Reviews" } as const;

// Link back to the user's home, or to the selector without an identity.
export async function HomeLink() {
  const user = await getCurrentUser();
  return (
    <Link
      href={user ? ROLE_HOME[user.role] : "/select-user"}
      className={`font-medium text-foreground underline underline-offset-4 ${FOCUS}`}
    >
      {user ? HOME_LABEL[user.role] : "Choose a demo user"}
    </Link>
  );
}
