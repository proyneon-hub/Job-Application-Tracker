import type { ApplicationStatus } from "@/lib/applications/constants";
import type { Application } from "@/lib/applications/types";
import { daysBetween } from "@/lib/dates";

/** No follow-up reminders for applications that are over. */
const CLOSED: ApplicationStatus[] = ["rejected", "withdrawn"];

export type OverdueFollowUp = { application: Application; daysOverdue: number };

/**
 * Follow-ups due today and overdue, as of `today` ("YYYY-MM-DD" in the user's timezone).
 * Overdue items come oldest first, so the most neglected one is at the top.
 */
export function getFollowUps(applications: Application[], today: string) {
  const dueToday: Application[] = [];
  const overdue: OverdueFollowUp[] = [];

  for (const app of applications) {
    if (!app.nextFollowUp || CLOSED.includes(app.status)) continue;
    const daysOverdue = daysBetween(app.nextFollowUp, today);
    if (daysOverdue === 0) dueToday.push(app);
    else if (daysOverdue > 0) overdue.push({ application: app, daysOverdue });
  }

  overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
  dueToday.sort((a, b) => a.company.localeCompare(b.company));
  return { dueToday, overdue };
}
