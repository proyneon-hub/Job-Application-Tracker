import { describe, expect, it } from "vitest";

import { addDays, daysBetween, todayLocal } from "./dates";

describe("dates", () => {
  it("adds and subtracts days across month and year boundaries", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("counts days between dates", () => {
    expect(daysBetween("2026-10-01", "2026-10-12")).toBe(11);
    expect(daysBetween("2026-10-12", "2026-10-01")).toBe(-11);
  });

  it("formats today in local time", () => {
    expect(todayLocal(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});
