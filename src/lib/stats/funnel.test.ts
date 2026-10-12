import { describe, expect, it } from "vitest";

import type { ApplicationStatus } from "@/lib/applications/constants";
import { makeApplication } from "@/lib/applications/test-factory";
import type { StatusEvent } from "@/lib/applications/types";

import { getFunnel } from "./funnel";

function events(applicationId: string, statuses: ApplicationStatus[]): StatusEvent[] {
  return statuses.map((toStatus, i) => ({
    id: `${applicationId}-${i}`,
    applicationId,
    fromStatus: i === 0 ? null : statuses[i - 1]!,
    toStatus,
    changedAt: `2026-10-0${i + 1}T12:00:00.000Z`,
  }));
}

describe("getFunnel", () => {
  it("counts each application at every stage up to the furthest it reached", () => {
    const offer = makeApplication({ status: "offer" });
    const rejectedAfterInterview = makeApplication({ status: "rejected" });
    const skippedScreening = makeApplication({ status: "interview" });
    const justApplied = makeApplication({ status: "applied" });
    const wishlist = makeApplication({ status: "wishlist", dateApplied: null });

    const all = [
      ...events(offer.id, ["applied", "screening", "interview", "offer"]),
      ...events(rejectedAfterInterview.id, ["applied", "screening", "interview", "rejected"]),
      ...events(skippedScreening.id, ["applied", "interview"]),
      ...events(justApplied.id, ["applied"]),
      ...events(wishlist.id, ["wishlist"]),
    ];

    const funnel = getFunnel(
      [offer, rejectedAfterInterview, skippedScreening, justApplied, wishlist],
      all,
    );
    expect(funnel.map((s) => [s.stage, s.count])).toEqual([
      ["applied", 4],
      ["screening", 3],
      ["interview", 3],
      ["offer", 1],
    ]);
    expect(funnel[3]?.shareOfApplied).toBe(0.25);
  });

  it("counts an application with a date applied but no history as applied", () => {
    const app = makeApplication({ status: "rejected", dateApplied: "2026-10-01" });
    expect(getFunnel([app], [])[0]?.count).toBe(1);
  });

  it("has no shares when nothing was applied for", () => {
    const funnel = getFunnel([makeApplication({ status: "wishlist", dateApplied: null })], []);
    expect(funnel.every((s) => s.count === 0 && s.shareOfApplied === null)).toBe(true);
  });
});
