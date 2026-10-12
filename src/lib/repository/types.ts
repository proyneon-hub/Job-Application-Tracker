import type { ApplicationStatus } from "@/lib/applications/constants";
import type { Application, ApplicationInput, StatusEvent } from "@/lib/applications/types";

/** A failed write: a message for the whole form, plus optional per-field messages. */
export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly fieldErrors?: Record<string, string[] | undefined>,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

/**
 * The one interface the UI uses to read and write applications.
 *
 * There are two implementations:
 * - SupabaseRepository: real accounts, data in Postgres (protected by row-level security).
 * - DemoRepository (Phase 6): "Try the demo", data only in the visitor's browser.
 *
 * Pages and components never import either implementation directly, so the whole
 * app works the same in both modes. Writes throw RepositoryError on failure.
 */
export interface ApplicationsRepository {
  listApplications(): Promise<Application[]>;
  createApplication(input: ApplicationInput): Promise<Application>;
  updateApplication(id: string, input: ApplicationInput): Promise<Application>;
  updateStatus(id: string, status: ApplicationStatus): Promise<Application>;
  deleteApplication(id: string): Promise<void>;
  /** Status history, oldest first. Pass an id for one application, or nothing for all. */
  listStatusEvents(applicationId?: string): Promise<StatusEvent[]>;
}
