import type { ApplicationStatus, WorkMode } from "./constants";

/**
 * A job application as the UI sees it (camelCase, no user_id).
 * Dates without a time ("date applied", "follow up on") are "YYYY-MM-DD" strings;
 * timestamps are ISO 8601 strings.
 */
export type Application = {
  id: string;
  company: string;
  roleTitle: string;
  postingUrl: string | null;
  location: string | null;
  workMode: WorkMode | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  source: string | null;
  status: ApplicationStatus;
  dateApplied: string | null;
  nextFollowUp: string | null;
  contactName: string | null;
  contactEmail: string | null;
  notes: string | null;
  /** The resume version sent with this application, if recorded. */
  resumeId: string | null;
  createdAt: string;
  updatedAt: string;
};

/** The fields a user can set when creating or editing an application. */
export type ApplicationInput = Omit<Application, "id" | "createdAt" | "updatedAt">;

/** One entry in an application's status history. `fromStatus` is null for the first entry. */
export type StatusEvent = {
  id: string;
  applicationId: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedAt: string;
};
