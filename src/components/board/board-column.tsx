"use client";

import { useDroppable } from "@dnd-kit/core";

import { STATUS_LABELS, type ApplicationStatus } from "@/lib/applications/constants";
import type { Application } from "@/lib/applications/types";
import { cn } from "@/lib/utils";

import { ApplicationCard } from "./application-card";

type BoardColumnProps = {
  status: ApplicationStatus;
  applications: Application[];
  onMove: (application: Application, status: ApplicationStatus) => void;
};

export function BoardColumn({ status, applications, onMove }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const headingId = `column-${status}`;

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={headingId}
      data-testid={`column-${status}`}
      className={cn(
        "flex w-72 shrink-0 snap-start flex-col gap-3 rounded-xl border bg-muted/40 p-3 transition-colors",
        isOver && "border-primary bg-accent",
      )}
    >
      <h2 id={headingId} className="flex items-center justify-between text-sm font-semibold">
        {STATUS_LABELS[status]}
        <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
          <span className="sr-only">, </span>
          {applications.length}
          <span className="sr-only">
            {" "}
            {applications.length === 1 ? "application" : "applications"}
          </span>
        </span>
      </h2>
      {applications.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Nothing here yet
        </p>
      ) : (
        <ul className="grid gap-2">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} onMove={(next) => onMove(app, next)} />
          ))}
        </ul>
      )}
    </section>
  );
}
