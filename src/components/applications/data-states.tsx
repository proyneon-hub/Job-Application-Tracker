"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Application } from "@/lib/applications/types";
import { useApplications } from "@/lib/repository/applications-provider";

/** Placeholder rows shown while data loads. Announced politely to screen readers. */
export function LoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-3">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 p-6"
    >
      <div className="flex items-center gap-2 font-medium">
        <AlertCircle className="size-5 text-destructive" aria-hidden="true" />
        {message}
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}

/**
 * Shows the loading or error state until the applications have loaded, then
 * renders its children with them. Saves every page repeating the same checks.
 */
export function WithApplications({
  children,
  loading,
}: {
  children: (applications: Application[]) => React.ReactNode;
  loading?: React.ReactNode;
}) {
  const { state, reload } = useApplications();
  if (state.status === "loading") return loading ?? <LoadingState />;
  if (state.status === "error") return <ErrorState message={state.message} onRetry={reload} />;
  return children(state.applications);
}
