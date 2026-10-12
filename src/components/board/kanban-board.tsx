"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import Link from "next/link";
import { useState } from "react";

import { EmptyState, WithApplications } from "@/components/applications/data-states";
import { Button } from "@/components/ui/button";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/applications/constants";
import type { Application } from "@/lib/applications/types";
import { getColumnJumpCoordinates } from "@/lib/board/keyboard";
import { groupByStatus } from "@/lib/board/group";
import { useApplications } from "@/lib/repository/applications-provider";
import { RepositoryError } from "@/lib/repository/types";
import { CardSummary, cardLabel } from "./application-card";
import { BoardColumn } from "./board-column";

/** Arrow keys jump between columns (see src/lib/board/keyboard.ts). */
const columnKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates, context },
) => {
  const columns = [...context.droppableRects.values()];
  const cardWidth = context.collisionRect?.width ?? 0;
  const next = getColumnJumpCoordinates(event.code, currentCoordinates, cardWidth, columns);
  if (next) event.preventDefault();
  return next;
};

/** Use the pointer position when there is one (mouse/touch), otherwise overlap (keyboard). */
const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : rectIntersection(args);
};

function isStatus(value: unknown): value is ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus);
}

export function KanbanBoardSection() {
  return (
    <WithApplications>
      {(applications) =>
        applications.length === 0 ? (
          <EmptyState
            title="Your board is empty"
            description="Add an application and it will show up in its status column."
            action={
              <Button asChild>
                <Link href="/applications/new">Add application</Link>
              </Button>
            }
          />
        ) : (
          <KanbanBoard applications={applications} />
        )
      }
    </WithApplications>
  );
}

export function KanbanBoard({ applications }: { applications: Application[] }) {
  const { updateStatus } = useApplications();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  const sensors = useSensors(
    // A small movement threshold so a simple click on the grip doesn't start a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // On touch screens, press and hold briefly so the page can still be scrolled.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: columnKeyboardCoordinates }),
  );

  const groups = groupByStatus(applications);
  const byId = new Map(applications.map((a) => [a.id, a]));
  const active = activeId ? byId.get(activeId) : undefined;

  function move(application: Application, status: ApplicationStatus) {
    if (application.status === status) return;
    setError(undefined);
    updateStatus(application.id, status).catch((e: unknown) => {
      setError(
        e instanceof RepositoryError
          ? e.message
          : `Couldn't move ${cardLabel(application)}. Please try again.`,
      );
    });
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    const application = byId.get(String(active.id));
    if (application && over && isStatus(over.id)) move(application, over.id);
  }

  // What screen readers hear while dragging (dnd-kit reads these out via a live region).
  const name = (id: string | number) => {
    const app = byId.get(String(id));
    return app ? cardLabel(app) : "application";
  };
  const column = (id: string | number | undefined) =>
    isStatus(id) ? `the ${STATUS_LABELS[id]} column` : "no column";
  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      `Picked up ${name(active.id)}. Use the left and right arrow keys to choose a column, Space to drop, or Escape to cancel.`,
    onDragOver: ({ active, over }) =>
      // Stay quiet while still over the card's own column, so the pick-up instructions aren't cut off.
      over?.id === byId.get(String(active.id))?.status
        ? undefined
        : `${name(active.id)} is over ${column(over?.id)}.`,
    onDragEnd: ({ active, over }) =>
      over
        ? `Dropped ${name(active.id)} in ${column(over.id)}.`
        : `${name(active.id)} was not moved.`,
    onDragCancel: ({ active }) => `Cancelled. ${name(active.id)} was not moved.`,
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/50 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
        accessibility={{
          announcements,
          screenReaderInstructions: {
            draggable:
              "To move this application, press Space or Enter, use the left and right arrow keys to choose a column, then press Space or Enter again. Press Escape to cancel. You can also use the Move to menu on each card.",
          },
        }}
      >
        {/* Scrolls sideways on small screens; each column snaps into place. "relative" keeps
            absolutely positioned children (like the screen-reader-only text) clipped inside it. */}
        <div
          data-testid="board-scroller"
          className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4"
        >
          {APPLICATION_STATUSES.map((status) => (
            <BoardColumn key={status} status={status} applications={groups[status]} onMove={move} />
          ))}
        </div>
        <DragOverlay>
          {active ? (
            <div className="w-72 rounded-lg border bg-card p-3 shadow-lg">
              <CardSummary application={active} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
