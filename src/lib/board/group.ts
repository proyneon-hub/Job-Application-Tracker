import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/applications/constants";
import type { Application } from "@/lib/applications/types";

/**
 * Splits applications into one list per status (every status present, even if empty),
 * most recently updated first, so a card you just moved appears at the top.
 */
export function groupByStatus(applications: Application[]) {
  const groups = Object.fromEntries(
    APPLICATION_STATUSES.map((status) => [status, [] as Application[]]),
  ) as Record<ApplicationStatus, Application[]>;

  for (const app of applications) {
    groups[app.status].push(app);
  }
  for (const status of APPLICATION_STATUSES) {
    groups[status].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  return groups;
}
