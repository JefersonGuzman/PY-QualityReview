"use client";

import { ErrorState } from "@/components/error-state";

// Error inside the app shell: the header and navigation stay visible.
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState reset={reset} />;
}
