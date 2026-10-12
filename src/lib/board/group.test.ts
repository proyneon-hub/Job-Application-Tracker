import { describe, expect, it } from "vitest";

import { APPLICATION_STATUSES } from "@/lib/applications/constants";
import { makeApplication } from "@/lib/applications/test-factory";

import { groupByStatus } from "./group";

describe("groupByStatus", () => {
  it("returns every status, even empty ones", () => {
    expect(Object.keys(groupByStatus([]))).toEqual([...APPLICATION_STATUSES]);
  });

  it("groups by status, most recently updated first", () => {
    const older = makeApplication({ status: "applied", updatedAt: "2026-10-01T00:00:00Z" });
    const newer = makeApplication({ status: "applied", updatedAt: "2026-10-05T00:00:00Z" });
    const offer = makeApplication({ status: "offer" });

    const groups = groupByStatus([older, offer, newer]);
    expect(groups.applied).toEqual([newer, older]);
    expect(groups.offer).toEqual([offer]);
    expect(groups.wishlist).toEqual([]);
  });
});
