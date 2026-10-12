import { describe, expect, it } from "vitest";

import { makeApplication } from "@/lib/applications/test-factory";

import { getApplicationsPerWeek, startOfWeek } from "./weekly";

describe("startOfWeek", () => {
  it("returns the Monday of the week", () => {
    expect(startOfWeek("2026-10-12")).toBe("2026-10-12"); // a Monday
    expect(startOfWeek("2026-10-18")).toBe("2026-10-12"); // the following Sunday
    expect(startOfWeek("2026-10-11")).toBe("2026-10-05"); // the Sunday before
  });
});

describe("getApplicationsPerWeek", () => {
  const TODAY = "2026-10-14"; // Wednesday

  it("returns the requested number of weeks, oldest first, including empty weeks", () => {
    const weeks = getApplicationsPerWeek([], TODAY, 3);
    expect(weeks).toEqual([
      { weekStart: "2026-09-28", count: 0 },
      { weekStart: "2026-10-05", count: 0 },
      { weekStart: "2026-10-12", count: 0 },
    ]);
  });

  it("counts by date applied and ignores undated, older and future applications", () => {
    const apps = [
      makeApplication({ dateApplied: "2026-10-12" }),
      makeApplication({ dateApplied: "2026-10-14" }),
      makeApplication({ dateApplied: "2026-10-04" }), // Sunday: previous week
      makeApplication({ dateApplied: "2026-09-01" }), // before the range
      makeApplication({ dateApplied: "2026-10-20" }), // in the future
      makeApplication({ dateApplied: null }),
    ];
    expect(getApplicationsPerWeek(apps, TODAY, 3).map((w) => w.count)).toEqual([1, 0, 2]);
  });
});
