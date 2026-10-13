import { STATUS_LABELS, WORK_MODE_LABELS } from "@/lib/applications/constants";
import type { Application } from "@/lib/applications/types";
import type { Resume } from "@/lib/resumes/types";

/**
 * Makes one CSV cell safe:
 * - Quotes it when it contains a comma, quote or line break, doubling inner quotes (RFC 4180).
 * - Guards against "CSV injection": spreadsheet apps run cells starting with = + - @
 *   (or a tab/carriage return) as formulas, so those get a leading apostrophe.
 */
export function csvCell(value: string | number | null) {
  if (value === null) return "";
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: (string | number | null)[][]) {
  // CRLF line endings, as the CSV spec and Excel expect.
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

type Column = [string, (app: Application, resumeName: string | null) => string | number | null];

const COLUMNS: Column[] = [
  ["Company", (a) => a.company],
  ["Role title", (a) => a.roleTitle],
  ["Status", (a) => STATUS_LABELS[a.status]],
  ["Work mode", (a) => (a.workMode ? WORK_MODE_LABELS[a.workMode] : null)],
  ["Location", (a) => a.location],
  ["Date applied", (a) => a.dateApplied],
  ["Next follow-up", (a) => a.nextFollowUp],
  ["Salary min", (a) => a.salaryMin],
  ["Salary max", (a) => a.salaryMax],
  ["Currency", (a) => a.salaryCurrency],
  ["Source", (a) => a.source],
  ["Resume", (_a, resumeName) => resumeName],
  ["Posting URL", (a) => a.postingUrl],
  ["Contact name", (a) => a.contactName],
  ["Contact email", (a) => a.contactEmail],
  ["Notes", (a) => a.notes],
  ["Created at", (a) => a.createdAt],
  ["Updated at", (a) => a.updatedAt],
];

/**
 * All of the user's applications as CSV text, one row each, with a header row.
 * Resumes are listed by name, which is what a spreadsheet reader needs.
 */
export function applicationsToCsv(applications: Application[], resumes: Resume[] = []) {
  const resumeNames = new Map(resumes.map((r) => [r.id, r.name]));
  return toCsv([
    COLUMNS.map(([header]) => header),
    ...applications.map((app) => {
      const resumeName = app.resumeId ? (resumeNames.get(app.resumeId) ?? null) : null;
      return COLUMNS.map(([, get]) => get(app, resumeName));
    }),
  ]);
}
