"use client";

import { AlertCircle, CalendarCheck, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Application } from "@/lib/applications/types";
import { useApplications } from "@/lib/repository/applications-provider";
import { RepositoryError } from "@/lib/repository/types";
import type { OverdueFollowUp } from "@/lib/stats/follow-ups";

type FollowUpsProps = { dueToday: Application[]; overdue: OverdueFollowUp[] };

/** Follow-ups that need attention now. "Done" clears the follow-up date. */
export function FollowUps({ dueToday, overdue }: FollowUpsProps) {
  const total = dueToday.length + overdue.length;

  return (
    <section aria-labelledby="follow-ups-heading" className="grid gap-3">
      <h2 id="follow-ups-heading" className="text-lg font-semibold">
        Follow-ups{" "}
        <span className="text-sm font-normal text-muted-foreground">({total} need attention)</span>
      </h2>
      {total === 0 ? (
        <p className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          <CalendarCheck className="size-4" aria-hidden="true" />
          Nothing due today or overdue. Nice work.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <FollowUpList
            title="Overdue"
            icon={<AlertCircle className="size-4 text-destructive" aria-hidden="true" />}
            items={overdue.map(({ application, daysOverdue }) => ({
              application,
              note: `${daysOverdue} ${daysOverdue === 1 ? "day" : "days"} overdue`,
            }))}
            empty="Nothing overdue."
          />
          <FollowUpList
            title="Due today"
            icon={<Clock className="size-4 text-muted-foreground" aria-hidden="true" />}
            items={dueToday.map((application) => ({ application, note: "Due today" }))}
            empty="Nothing due today."
          />
        </div>
      )}
    </section>
  );
}

type FollowUpListProps = {
  title: string;
  icon: React.ReactNode;
  items: { application: Application; note: string }[];
  empty: string;
};

function FollowUpList({ title, icon, items, empty }: FollowUpListProps) {
  const headingId = `follow-ups-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="grid content-start gap-3 rounded-xl border bg-card p-4">
      <h3 id={headingId} className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
        <span className="font-normal text-muted-foreground">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul aria-labelledby={headingId} className="divide-y">
          {items.map(({ application, note }) => (
            <FollowUpItem key={application.id} application={application} note={note} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FollowUpItem({ application: app, note }: { application: Application; note: string }) {
  const { updateApplication } = useApplications();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function markDone() {
    setPending(true);
    setError(undefined);
    try {
      const { id: _id, createdAt: _c, updatedAt: _u, ...input } = app;
      await updateApplication(app.id, { ...input, nextFollowUp: null });
    } catch (e) {
      setError(e instanceof RepositoryError ? e.message : "Couldn't update. Please try again.");
      setPending(false);
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <div className="grid min-w-0 gap-0.5">
        <Link
          href={`/applications/${app.id}`}
          className="truncate font-medium underline-offset-4 hover:underline"
        >
          {app.company}
        </Link>
        <p className="truncate text-sm text-muted-foreground">{app.roleTitle}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={markDone}
        disabled={pending}
        aria-label={`Mark follow-up for ${app.roleTitle} at ${app.company} as done`}
      >
        Done
      </Button>
    </li>
  );
}
