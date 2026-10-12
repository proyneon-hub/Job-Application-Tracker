import type { Application } from "@/lib/applications/types";
import { addDays } from "@/lib/dates";

/** Monday of the week containing `date` (weeks run Monday to Sunday, as in ISO 8601). */
export function startOfWeek(date: string) {
  const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(date, -((dayOfWeek + 6) % 7));
}

export type WeekCount = { weekStart: string; count: number };

/**
 * Applications per week by date applied, for the last `weeks` weeks up to and
 * including the current one. Weeks with no applications are included as 0, so
 * the chart shows gaps honestly.
 */
export function getApplicationsPerWeek(
  applications: Application[],
  today: string,
  weeks = 8,
): WeekCount[] {
  const firstWeek = addDays(startOfWeek(today), -7 * (weeks - 1));
  const counts: WeekCount[] = Array.from({ length: weeks }, (_, i) => ({
    weekStart: addDays(firstWeek, 7 * i),
    count: 0,
  }));

  for (const app of applications) {
    if (!app.dateApplied || app.dateApplied < firstWeek || app.dateApplied > today) continue;
    const index = counts.findIndex((w) => w.weekStart === startOfWeek(app.dateApplied!));
    if (index !== -1) counts[index]!.count += 1;
  }
  return counts;
}
