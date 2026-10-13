import type { Application, StatusEvent } from "@/lib/applications/types";
import type { Resume } from "@/lib/resumes/types";

import { firstResponse, groupEvents, wasSent } from "./summary";

export type ResumeStat = {
  /** null for the "No resume recorded" row. */
  resumeId: string | null;
  name: string;
  sent: number;
  responded: number;
  /** responded / sent, from 0 to 1. Null when nothing has been sent with it. */
  responseRate: number | null;
};

export const NO_RESUME_LABEL = "No resume recorded";

/**
 * Response rate per resume version, using the same definitions of "sent" and
 * "response" as the summary stats. Every resume gets a row (even unused ones);
 * a "No resume recorded" row is added only when some sent applications have none.
 * Sorted by applications sent, most first.
 */
export function getResumeStats(
  applications: Application[],
  events: StatusEvent[],
  resumes: Resume[],
): ResumeStat[] {
  const histories = groupEvents(events);
  const rows = new Map<string | null, ResumeStat>(
    resumes.map((r) => [
      r.id,
      { resumeId: r.id, name: r.name, sent: 0, responded: 0, responseRate: null },
    ]),
  );

  for (const app of applications) {
    const history = histories.get(app.id) ?? [];
    if (!wasSent(app, history)) continue;

    // A link to a resume that isn't loaded counts as none recorded.
    const key = app.resumeId !== null && rows.has(app.resumeId) ? app.resumeId : null;
    let row = rows.get(key);
    if (!row) {
      row = { resumeId: null, name: NO_RESUME_LABEL, sent: 0, responded: 0, responseRate: null };
      rows.set(null, row);
    }
    row.sent += 1;
    if (firstResponse(history)) row.responded += 1;
  }

  return [...rows.values()]
    .map((row) => ({ ...row, responseRate: row.sent > 0 ? row.responded / row.sent : null }))
    .toSorted((a, b) => {
      // Keep "No resume recorded" last, so the real versions are compared first.
      if ((a.resumeId === null) !== (b.resumeId === null)) return a.resumeId === null ? 1 : -1;
      return b.sent - a.sent || a.name.localeCompare(b.name);
    });
}
