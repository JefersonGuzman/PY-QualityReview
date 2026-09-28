"use client";

import { ErrorState } from "@/components/error-state";

// Error on the root pages (start screen, user selector): without it Next.js shows its
// default dark error screen, e.g. when the database is not running.
export default function RootError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <ErrorState reset={reset} />
    </main>
  );
}
