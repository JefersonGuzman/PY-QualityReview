import { HomeLink } from "@/components/home-link";
import { PageTitle } from "@/components/ui";

// HTTP 403. Rendered inside app/(app)/layout.tsx, which already provides the header and navigation.
export default function Forbidden() {
  return (
    <>
      <PageTitle>Access denied</PageTitle>
      <p className="mt-2 text-muted">This page is not available for your role.</p>
      <p className="mt-6">
        <HomeLink />
      </p>
    </>
  );
}
