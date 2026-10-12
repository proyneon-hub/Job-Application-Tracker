import type { Application, ApplicationInput, StatusEvent } from "@/lib/applications/types";
import type { Database } from "@/lib/supabase/database.types";

type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"];
type ApplicationWrite = Database["public"]["Tables"]["applications"]["Insert"];
type StatusEventRow = Database["public"]["Tables"]["status_events"]["Row"];

// The database uses snake_case column names; the app uses camelCase.
// Keeping the translation in one place means the rest of the app never sees a row.

export function toApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    company: row.company,
    roleTitle: row.role_title,
    postingUrl: row.posting_url,
    location: row.location,
    workMode: row.work_mode,
    salaryMin: row.salary_min,
    salaryMax: row.salary_max,
    salaryCurrency: row.salary_currency,
    source: row.source,
    status: row.status,
    dateApplied: row.date_applied,
    nextFollowUp: row.next_follow_up,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Columns to write. Note there's no user_id: the database fills it in from the session. */
export function toApplicationWrite(input: ApplicationInput): ApplicationWrite {
  return {
    company: input.company,
    role_title: input.roleTitle,
    posting_url: input.postingUrl,
    location: input.location,
    work_mode: input.workMode,
    salary_min: input.salaryMin,
    salary_max: input.salaryMax,
    salary_currency: input.salaryCurrency,
    source: input.source,
    status: input.status,
    date_applied: input.dateApplied,
    next_follow_up: input.nextFollowUp,
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    notes: input.notes,
  };
}

export function toStatusEvent(row: StatusEventRow): StatusEvent {
  return {
    id: String(row.id),
    applicationId: row.application_id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    changedAt: row.changed_at,
  };
}
