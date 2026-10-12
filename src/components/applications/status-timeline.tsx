"use client";

import { useEffect, useState } from "react";

import { describeStatusEvent } from "@/lib/applications/history";
import type { Application, StatusEvent } from "@/lib/applications/types";
import { formatDateTime } from "@/lib/format";
import { useApplications } from "@/lib/repository/applications-provider";

import { StatusBadge } from "./status-badge";

type TimelineState =
  { status: "loading" } | { status: "error" } | { status: "ready"; events: StatusEvent[] };

/**
 * Every status change for one application, oldest first.
 * Reloads whenever the application is saved (its updatedAt changes).
 */
export function StatusTimeline({ application }: { application: Application }) {
  const { repository } = useApplications();
  const [state, setState] = useState<TimelineState>({ status: "loading" });
  const { id, updatedAt } = application;

  useEffect(() => {
    let cancelled = false;
    repository
      .listStatusEvents(id)
      .then((events) => !cancelled && setState({ status: "ready", events }))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [repository, id, updatedAt]);

  return (
    <section aria-labelledby="history-heading" className="grid gap-3">
      <h2 id="history-heading" className="text-lg font-semibold">
        Status history
      </h2>
      {state.status === "loading" ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading history…
        </p>
      ) : state.status === "error" ? (
        <p className="text-sm text-destructive" role="alert">
          Couldn&apos;t load the status history.
        </p>
      ) : state.events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>
      ) : (
        <ol
          className="ml-2 grid gap-4 border-l border-border pl-6"
          aria-label="Status changes, oldest first"
        >
          {state.events.map((event) => (
            <li key={event.id} className="relative grid gap-1">
              <span
                className="absolute top-1.5 -left-[1.85rem] size-2.5 rounded-full bg-primary ring-4 ring-background"
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="sr-only">{describeStatusEvent(event)}</span>
                <span aria-hidden="true" className="flex items-center gap-2">
                  {event.fromStatus ? (
                    <>
                      <StatusBadge status={event.fromStatus} />→
                    </>
                  ) : (
                    <span className="text-sm">Added as</span>
                  )}
                  <StatusBadge status={event.toStatus} />
                </span>
              </div>
              <time dateTime={event.changedAt} className="text-xs text-muted-foreground">
                {formatDateTime(event.changedAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
