import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/session";
import { ROLE_HOME } from "@/lib/domain/types";

export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? ROLE_HOME[user.role] : "/select-user");
}
