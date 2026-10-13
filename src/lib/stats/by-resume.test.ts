import { describe, expect, it } from "vitest";

import type { ApplicationStatus } from "@/lib/applications/constants";
import { makeApplication } from "@/lib/applications/test-factory";
import type { StatusEvent } from "@/lib/applications/types";
import type { Resume } from "@/lib/resumes/types";

import { getResumeStats, NO_RESUME_LABEL } from "./by-resume";

let n = 0;
function history(applicationId: string, steps: ApplicationStatus[]): StatusEvent[] {
  return steps.map((toStatus, i) => ({
    id: String((n += 1)),
    applicationId,
    fromStatus: i === 0 ? null : steps[i - 1]!,
    toStatus,
    changedAt: `2026-10-0${i + 1}T12:00:00.000Z`,
  }));
}

function resume(id: number, name: string): Resume {
  return {
    id: `de0c0000-0000-4000-8000-00000000000${id}`,
    name,
    linkUrl: null,
    notes: null,
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z",
  };
}

const general = resume(1, "General – v2");
const frontend = resume(2, "Frontend – v3");

describe("getResumeStats", () => {
  it("lists every resume, with no rate when nothing was sent", () => {
    expect(getResumeStats([], [], [general])).toEqual([
      { resumeId: general.id, name: "General – v2", sent: 0, responded: 0, responseRate: null },
    ]);
  });

  it("computes the response rate per resume, counting a rejection as a response", () => {
    const a = makeApplication({ resumeId: frontend.id, status: "interview" });
    const b = makeApplication({ resumeId: frontend.id, status: "rejected" });
    const c = makeApplication({ resumeId: frontend.id, status: "applied" });
    const d = makeApplication({ resumeId: general.id, status: "applied" });
    const events = [
      ...history(a.id, ["applied", "screening", "interview"]),
      ...history(b.id, ["applied", "rejected"]),
      ...history(c.id, ["applied"]),
      ...history(d.id, ["applied"]),
    ];

    const stats = getResumeStats([a, b, c, d], events, [general, frontend]);

    expect(stats.map((s) => [s.name, s.sent, s.responded])).toEqual([
      ["Frontend – v3", 3, 2],
      ["General – v2", 1, 0],
    ]);
    expect(stats[0]!.responseRate).toBeCloseTo(2 / 3);
    expect(stats[1]!.responseRate).toBe(0);
  });

  it("puts sent applications without a resume in a last 'none recorded' row", () => {
    const linked = makeApplication({ resumeId: general.id, status: "applied" });
    const unlinked = makeApplication({ resumeId: null, status: "screening" });
    const orphaned = makeApplication({
      resumeId: "de0c0000-0000-4000-8000-000000000099",
      status: "applied",
    });
    const events = [
      ...history(linked.id, ["applied"]),
      ...history(unlinked.id, ["applied", "screening"]),
      ...history(orphaned.id, ["applied"]),
    ];

    const stats = getResumeStats([linked, unlinked, orphaned], events, [general]);

    expect(stats.at(-1)).toEqual({
      resumeId: null,
      name: NO_RESUME_LABEL,
      sent: 2,
      responded: 1,
      responseRate: 0.5,
    });
  });

  it("ignores applications that haven't been sent", () => {
    const wishlist = makeApplication({
      resumeId: general.id,
      status: "wishlist",
      dateApplied: null,
    });
    const stats = getResumeStats([wishlist], history(wishlist.id, ["wishlist"]), [general]);
    expect(stats).toEqual([expect.objectContaining({ sent: 0, responseRate: null })]);
  });
});
