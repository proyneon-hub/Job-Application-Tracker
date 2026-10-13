import type { Application } from "./types";

let counter = 0;

/** Builds a fictional Application for tests, with any fields overridden. */
export function makeApplication(overrides: Partial<Application> = {}): Application {
  counter += 1;
  return {
    id: `00000000-0000-4000-8000-${String(counter).padStart(12, "0")}`,
    company: "Example Widgets Ltd",
    roleTitle: "Software Engineer",
    postingUrl: null,
    location: null,
    workMode: null,
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: "USD",
    source: null,
    status: "applied",
    dateApplied: "2026-10-01",
    nextFollowUp: null,
    contactName: null,
    contactEmail: null,
    notes: null,
    resumeId: null,
    createdAt: "2026-10-01T09:00:00.000Z",
    updatedAt: "2026-10-01T09:00:00.000Z",
    ...overrides,
  };
}
