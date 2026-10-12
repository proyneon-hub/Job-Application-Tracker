import type { ApplicationStatus } from "@/lib/applications/constants";
import type { Application, StatusEvent } from "@/lib/applications/types";
import { daysBetween } from "@/lib/dates";

/** Statuses that mean the application was sent (Applied or anything that follows it). */
const SENT: ApplicationStatus[] = ["applied", "screening", "interview", "offer", "rejected"];

/** Statuses that mean the company replied. A rejection is still a response. */
const RESPONSES: ApplicationStatus[] = ["screening", "interview", "offer", "rejected"];

const IN_PROGRESS: ApplicationStatus[] = ["applied", "screening", "interview"];

/** Status events grouped by application, each list oldest first. */
export function groupEvents(events: StatusEvent[]) {
  const byApplication = new Map<string, StatusEvent[]>();
  for (const event of events.toSorted((a, b) => a.changedAt.localeCompare(b.changedAt))) {
    const list = byApplication.get(event.applicationId) ?? [];
    list.push(event);
    byApplication.set(event.applicationId, list);
  }
  return byApplication;
}

/** True once an application has been sent, judged by its date applied or its history. */
export function wasSent(app: Application, history: StatusEvent[]) {
  return app.dateApplied !== null || history.some((e) => SENT.includes(e.toStatus));
}

/** The first time the company replied, or undefined if it hasn't. */
export function firstResponse(history: StatusEvent[]) {
  return history.find((e) => RESPONSES.includes(e.toStatus));
}

export type SummaryStats = {
  total: number;
  inProgress: number;
  sent: number;
  responded: number;
  /** responded / sent, from 0 to 1. Null when nothing has been sent yet. */
  responseRate: number | null;
  /** Mean days from date applied to first response, 1 decimal place. Null with no data. */
  averageDaysToFirstResponse: number | null;
};

export function getSummaryStats(applications: Application[], events: StatusEvent[]): SummaryStats {
  const histories = groupEvents(events);
  let sent = 0;
  let responded = 0;
  const responseDays: number[] = [];

  for (const app of applications) {
    const history = histories.get(app.id) ?? [];
    if (!wasSent(app, history)) continue;
    sent += 1;

    const response = firstResponse(history);
    if (!response) continue;
    responded += 1;

    if (app.dateApplied) {
      // changedAt is a UTC timestamp; its date part is close enough for a day count.
      const days = daysBetween(app.dateApplied, response.changedAt.slice(0, 10));
      // A negative gap means the date applied was entered after the fact; skip it.
      if (days >= 0) responseDays.push(days);
    }
  }

  const average =
    responseDays.length > 0
      ? Math.round((responseDays.reduce((sum, d) => sum + d, 0) / responseDays.length) * 10) / 10
      : null;

  return {
    total: applications.length,
    inProgress: applications.filter((a) => IN_PROGRESS.includes(a.status)).length,
    sent,
    responded,
    responseRate: sent > 0 ? responded / sent : null,
    averageDaysToFirstResponse: average,
  };
}
