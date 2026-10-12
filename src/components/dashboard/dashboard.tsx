"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState, WithApplications } from "@/components/applications/data-states";
import { Button } from "@/components/ui/button";
import type { Application, StatusEvent } from "@/lib/applications/types";
import { todayLocal } from "@/lib/dates";
import { useApplications } from "@/lib/repository/applications-provider";
import { getFollowUps } from "@/lib/stats/follow-ups";
import { getFunnel } from "@/lib/stats/funnel";
import { getSummaryStats } from "@/lib/stats/summary";
import { getApplicationsPerWeek } from "@/lib/stats/weekly";

import { FollowUps } from "./follow-ups";
import { FunnelChart } from "./funnel-chart";
import { StatTile } from "./stat-tile";
import { WeeklyChart } from "./weekly-chart";

export function DashboardSection() {
  return (
    <WithApplications>
      {(applications) =>
        applications.length === 0 ? (
          <EmptyState
            title="Welcome! Let's add your first application"
            description="Your follow-ups and stats will appear here as you track applications."
            action={
              <Button asChild>
                <Link href="/applications/new">Add application</Link>
              </Button>
            }
          />
        ) : (
          <Dashboard applications={applications} />
        )
      }
    </WithApplications>
  );
}

function Dashboard({ applications }: { applications: Application[] }) {
  const { repository } = useApplications();
  const [events, setEvents] = useState<StatusEvent[] | null>(null);
  const [eventsFailed, setEventsFailed] = useState(false);

  // Reload the status history whenever any application changes (e.g. a status update).
  const version = applications.map((a) => a.updatedAt).join("|");
  useEffect(() => {
    let cancelled = false;
    repository
      .listStatusEvents()
      .then((loaded) => !cancelled && setEvents(loaded))
      .catch(() => !cancelled && setEventsFailed(true));
    return () => {
      cancelled = true;
    };
  }, [repository, version]);

  // "Today" in the viewer's own timezone, so "due today" matches their calendar.
  const today = todayLocal();
  const followUps = useMemo(() => getFollowUps(applications, today), [applications, today]);
  const weeks = useMemo(() => getApplicationsPerWeek(applications, today), [applications, today]);
  const summary = useMemo(
    () => getSummaryStats(applications, events ?? []),
    [applications, events],
  );
  const funnel = useMemo(() => getFunnel(applications, events ?? []), [applications, events]);
  const statsReady = events !== null;

  const responseRate =
    summary.responseRate === null ? "—" : `${Math.round(summary.responseRate * 100)}%`;
  const averageDays =
    summary.averageDaysToFirstResponse === null
      ? "—"
      : `${summary.averageDaysToFirstResponse} ${summary.averageDaysToFirstResponse === 1 ? "day" : "days"}`;

  return (
    <div className="grid grid-cols-1 gap-8">
      <FollowUps dueToday={followUps.dueToday} overdue={followUps.overdue} />

      <section aria-labelledby="stats-heading" className="grid gap-4">
        <h2 id="stats-heading" className="text-lg font-semibold">
          Stats
        </h2>
        {eventsFailed ? (
          <p role="alert" className="text-sm text-destructive">
            Couldn&apos;t load your status history, so some stats are missing.
          </p>
        ) : null}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Total applications" value={String(summary.total)} />
          <StatTile
            label="In progress"
            value={String(summary.inProgress)}
            detail="Applied, screening or interviewing"
          />
          <StatTile
            label="Response rate"
            value={statsReady ? responseRate : "…"}
            detail={
              statsReady ? `${summary.responded} of ${summary.sent} sent got a reply` : undefined
            }
          />
          <StatTile
            label="Avg. time to first response"
            value={statsReady ? averageDays : "…"}
            detail="From date applied to first reply"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WeeklyChart weeks={weeks} />
          {statsReady ? <FunnelChart steps={funnel} /> : null}
        </div>
      </section>
    </div>
  );
}
