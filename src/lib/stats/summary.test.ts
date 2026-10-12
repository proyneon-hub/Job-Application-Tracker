import { describe, expect, it } from "vitest";

import type { ApplicationStatus } from "@/lib/applications/constants";
import { makeApplication } from "@/lib/applications/test-factory";
import type { StatusEvent } from "@/lib/applications/types";

import { getSummaryStats } from "./summary";

let n = 0;
function history(applicationId: string, steps: [ApplicationStatus, string][]): StatusEvent[] {
  return steps.map(([toStatus, date], i) => ({
    id: String((n += 1)),
    applicationId,
    fromStatus: i === 0 ? null : steps[i - 1]![0],
    toStatus,
    changedAt: `${date}T12:00:00.000Z`,
  }));
}

describe("getSummaryStats", () => {
  it("returns empty-state values when there is nothing yet", () => {
    expect(getSummaryStats([], [])).toEqual({
      total: 0,
      inProgress: 0,
      sent: 0,
      responded: 0,
      responseRate: null,
      averageDaysToFirstResponse: null,
    });
  });

  it("computes response rate and average days to first response", () => {
    // Replied (screening) after 4 days.
    const a = makeApplication({ status: "interview", dateApplied: "2026-10-01" });
    // Rejected after 10 days: still counts as a response.
    const b = makeApplication({ status: "rejected", dateApplied: "2026-09-20" });
    // Applied, no reply yet.
    const c = makeApplication({ status: "applied", dateApplied: "2026-10-05" });
    // Wishlist only: not sent, so not part of the rate.
    const d = makeApplication({ status: "wishlist", dateApplied: null });

    const events = [
      ...history(a.id, [
        ["applied", "2026-10-01"],
        ["screening", "2026-10-05"],
        ["interview", "2026-10-09"],
      ]),
      ...history(b.id, [
        ["applied", "2026-09-20"],
        ["rejected", "2026-09-30"],
      ]),
      ...history(c.id, [["applied", "2026-10-05"]]),
      ...history(d.id, [["wishlist", "2026-10-06"]]),
    ];

    const stats = getSummaryStats([a, b, c, d], events);
    expect(stats.total).toBe(4);
    expect(stats.inProgress).toBe(2);
    expect(stats.sent).toBe(3);
    expect(stats.responded).toBe(2);
    expect(stats.responseRate).toBeCloseTo(2 / 3);
    expect(stats.averageDaysToFirstResponse).toBe(7); // (4 + 10) / 2
  });

  it("uses the first response only, and handles events given out of order", () => {
    const a = makeApplication({ status: "offer", dateApplied: "2026-10-01" });
    const events = history(a.id, [
      ["applied", "2026-10-01"],
      ["interview", "2026-10-03"],
      ["offer", "2026-10-11"],
    ]).reverse();
    expect(getSummaryStats([a], events).averageDaysToFirstResponse).toBe(2);
  });

  it("counts an application with a date applied as sent even without history", () => {
    const a = makeApplication({ status: "applied", dateApplied: "2026-10-01" });
    expect(getSummaryStats([a], []).sent).toBe(1);
  });

  it("ignores negative gaps from back-dated entries", () => {
    const a = makeApplication({ status: "screening", dateApplied: "2026-10-10" });
    const events = history(a.id, [["screening", "2026-10-01"]]);
    const stats = getSummaryStats([a], events);
    expect(stats.responded).toBe(1);
    expect(stats.averageDaysToFirstResponse).toBeNull();
  });
});
