import { describe, expect, it } from "vitest";

import { describeStatusEvent } from "./history";

describe("describeStatusEvent", () => {
  it("describes the first event and later changes", () => {
    expect(describeStatusEvent({ fromStatus: null, toStatus: "wishlist" })).toBe(
      "Added as Wishlist",
    );
    expect(describeStatusEvent({ fromStatus: "applied", toStatus: "screening" })).toBe(
      "Applied → Screening",
    );
  });
});
