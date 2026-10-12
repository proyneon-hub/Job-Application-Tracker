import { describe, expect, it } from "vitest";

import { DEFAULT_FILTERS, filterApplications, hasActiveFilters } from "./filter";
import { makeApplication } from "./test-factory";

const rockets = makeApplication({
  company: "Fictional Rockets Ltd",
  roleTitle: "Backend Engineer",
  status: "interview",
  workMode: "remote",
  dateApplied: "2026-09-10",
});
const paper = makeApplication({
  company: "Sample Paper Co",
  roleTitle: "Frontend Engineer",
  status: "applied",
  workMode: "hybrid",
  dateApplied: "2026-09-20",
  notes: "Referred by a former teammate",
});
const analytics = makeApplication({
  company: "Placeholder Analytics",
  roleTitle: "Data Analyst",
  status: "wishlist",
  workMode: "remote",
  dateApplied: null,
});
const all = [rockets, paper, analytics];

describe("filterApplications", () => {
  it("returns everything, newest first, with undated items last", () => {
    expect(filterApplications(all, DEFAULT_FILTERS).map((a) => a.company)).toEqual([
      "Sample Paper Co",
      "Fictional Rockets Ltd",
      "Placeholder Analytics",
    ]);
  });

  it("sorts oldest first and still keeps undated items last", () => {
    const result = filterApplications(all, { ...DEFAULT_FILTERS, sort: "oldest" });
    expect(result.map((a) => a.company)).toEqual([
      "Fictional Rockets Ltd",
      "Sample Paper Co",
      "Placeholder Analytics",
    ]);
  });

  it("searches across company, role and notes, ignoring case and spaces", () => {
    expect(filterApplications(all, { ...DEFAULT_FILTERS, query: "  ENGINEER " })).toHaveLength(2);
    expect(filterApplications(all, { ...DEFAULT_FILTERS, query: "teammate" })).toEqual([paper]);
  });

  it("filters by status and work mode together", () => {
    const result = filterApplications(all, {
      ...DEFAULT_FILTERS,
      status: "interview",
      workMode: "remote",
    });
    expect(result).toEqual([rockets]);
  });

  it("does not modify the input array", () => {
    const input = [...all];
    filterApplications(input, { ...DEFAULT_FILTERS, sort: "oldest" });
    expect(input).toEqual(all);
  });
});

describe("hasActiveFilters", () => {
  it("ignores sort order and blank search text", () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, sort: "oldest", query: "  " })).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, status: "offer" })).toBe(true);
  });
});
