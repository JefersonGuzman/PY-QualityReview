import { HomeLink } from "@/components/home-link";
import { PageTitle } from "@/components/ui";

// HTTP 404 for unknown URLs (rendered in the root layout, without the app shell).
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <PageTitle>Not found</PageTitle>
      <p className="mt-2 text-muted">This page does not exist.</p>
      <p className="mt-6">
        <HomeLink />
      </p>
    </main>
  );
}
