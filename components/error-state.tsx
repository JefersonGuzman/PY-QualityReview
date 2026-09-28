"use client";

import { Button, PageTitle } from "@/components/ui";

// Designed error state shared by the app pages and the root pages
// (most often: the local database is not running).
export function ErrorState({ reset }: { reset: () => void }) {
  return (
    <>
      <PageTitle>Something went wrong</PageTitle>
      <p className="mt-2 text-muted">
        We could not load this page. If you are running locally, check that the database is up with npm run db:start,
        then try again.
      </p>
      <div className="mt-6">
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
      </div>
    </>
  );
}
