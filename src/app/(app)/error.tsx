"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/applications/data-states";

/** Catches unexpected errors in any logged-in page, so the header and nav keep working. */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState message="Something went wrong on this page." onRetry={retry} />;
}
