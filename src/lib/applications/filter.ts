import type { ApplicationStatus, WorkMode } from "./constants";
import type { Application } from "./types";

export type DateSort = "newest" | "oldest";

export type ApplicationFilters = {
  query: string;
  status: ApplicationStatus | "all";
  workMode: WorkMode | "all";
  sort: DateSort;
};

export const DEFAULT_FILTERS: ApplicationFilters = {
  query: "",
  status: "all",
  workMode: "all",
  sort: "newest",
};

const SEARCHABLE_FIELDS = [
  "company",
  "roleTitle",
  "location",
  "source",
  "contactName",
  "notes",
] as const satisfies readonly (keyof Application)[];

function matchesQuery(app: Application, query: string) {
  if (!query) return true;
  return SEARCHABLE_FIELDS.some((field) => app[field]?.toLowerCase().includes(query));
}

/**
 * Filters by search text, status and work mode, then sorts by date applied.
 * Applications without a date applied (e.g. wishlist items) always go last.
 * Pure function: returns a new array and never changes its input.
 */
export function filterApplications(applications: Application[], filters: ApplicationFilters) {
  const query = filters.query.trim().toLowerCase();
  const direction = filters.sort === "newest" ? -1 : 1;

  return applications
    .filter(
      (app) =>
        (filters.status === "all" || app.status === filters.status) &&
        (filters.workMode === "all" || app.workMode === filters.workMode) &&
        matchesQuery(app, query),
    )
    .toSorted((a, b) => {
      if (a.dateApplied !== b.dateApplied) {
        if (a.dateApplied === null) return 1;
        if (b.dateApplied === null) return -1;
        // "YYYY-MM-DD" strings sort correctly as plain text.
        return a.dateApplied < b.dateApplied ? -direction : direction;
      }
      // Same date (or both missing): most recently added first.
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function hasActiveFilters(filters: ApplicationFilters) {
  return filters.query.trim() !== "" || filters.status !== "all" || filters.workMode !== "all";
}
