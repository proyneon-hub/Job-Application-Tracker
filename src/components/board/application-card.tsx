"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import Link from "next/link";

import { NativeSelect } from "@/components/ui/native-select";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/applications/constants";
import type { Application } from "@/lib/applications/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function cardLabel(app: Pick<Application, "roleTitle" | "company">) {
  return `${app.roleTitle} at ${app.company}`;
}

type ApplicationCardProps = {
  application: Application;
  onMove: (status: ApplicationStatus) => void;
};

/**
 * A card on the board. Only the grip button starts a drag (by mouse, touch, or
 * Space/Enter on the keyboard), so the link and the "Move to" select inside the
 * card keep working normally.
 */
export function ApplicationCard({ application: app, onMove }: ApplicationCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: app.id,
  });

  return (
    <li
      ref={setNodeRef}
      className={cn(
        "grid gap-2 rounded-lg border bg-card p-3 shadow-xs",
        // The DragOverlay shows the moving copy; the original stays as a faded placeholder.
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="-ml-1 cursor-grab touch-none rounded p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing"
          aria-label={`Drag ${cardLabel(app)}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>
        <CardSummary application={app} />
      </div>
      <NativeSelect
        aria-label={`Move ${cardLabel(app)} to`}
        value={app.status}
        onChange={(e) => onMove(e.target.value as ApplicationStatus)}
        className="h-8 text-xs md:text-xs"
      >
        {APPLICATION_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status === app.status
              ? `In ${STATUS_LABELS[status]}`
              : `Move to ${STATUS_LABELS[status]}`}
          </option>
        ))}
      </NativeSelect>
    </li>
  );
}

/** Company, role and dates. Shared by the card and the drag preview. */
export function CardSummary({ application: app }: { application: Application }) {
  return (
    <div className="grid min-w-0 flex-1 gap-0.5">
      <Link
        href={`/applications/${app.id}`}
        className="truncate font-medium underline-offset-4 hover:underline"
      >
        {app.company}
      </Link>
      <p className="truncate text-sm text-muted-foreground">{app.roleTitle}</p>
      <p className="text-xs text-muted-foreground">
        {app.dateApplied ? `Applied ${formatDate(app.dateApplied)}` : "Not applied yet"}
      </p>
      {app.nextFollowUp ? (
        <p className="text-xs text-muted-foreground">Follow up {formatDate(app.nextFollowUp)}</p>
      ) : null}
    </div>
  );
}
