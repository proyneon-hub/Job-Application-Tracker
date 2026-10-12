import { describe, expect, it } from "vitest";

import { makeApplication } from "@/lib/applications/test-factory";

import { getFollowUps } from "./follow-ups";

const TODAY = "2026-10-12";

describe("getFollowUps", () => {
  it("splits follow-ups into due today and overdue (oldest first), ignoring future ones", () => {
    const today = makeApplication({ company: "Due Today Co", nextFollowUp: TODAY });
    const late2 = makeApplication({ company: "Two Days Late", nextFollowUp: "2026-10-10" });
    const late9 = makeApplication({ company: "Nine Days Late", nextFollowUp: "2026-10-03" });
    const future = makeApplication({ nextFollowUp: "2026-10-13" });
    const none = makeApplication({ nextFollowUp: null });

    const result = getFollowUps([late2, future, today, none, late9], TODAY);

    expect(result.dueToday).toEqual([today]);
    expect(result.overdue).toEqual([
      { application: late9, daysOverdue: 9 },
      { application: late2, daysOverdue: 2 },
    ]);
  });

  it("skips applications that are rejected or withdrawn", () => {
    const rejected = makeApplication({ status: "rejected", nextFollowUp: "2026-10-01" });
    const withdrawn = makeApplication({ status: "withdrawn", nextFollowUp: TODAY });
    expect(getFollowUps([rejected, withdrawn], TODAY)).toEqual({ dueToday: [], overdue: [] });
  });
});
