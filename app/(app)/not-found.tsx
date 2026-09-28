import { HomeLink } from "@/components/home-link";
import { PageTitle } from "@/components/ui";

// HTTP 404 inside the app (e.g. a response outside the Team Lead's brands).
export default function NotFound() {
  return (
    <>
      <PageTitle>Not found</PageTitle>
      <p className="mt-2 text-muted">This page does not exist or is not available to you.</p>
      <p className="mt-6">
        <HomeLink />
      </p>
    </>
  );
}
