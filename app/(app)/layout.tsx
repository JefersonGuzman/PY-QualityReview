import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/data/session";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  return <AppShell user={user}>{children}</AppShell>;
}
