import { describe, expect, it } from "vitest";

import { formatDate, formatSalaryRange } from "./format";

describe("formatDate", () => {
  it("formats a date-only string without shifting the day", () => {
    expect(formatDate("2026-10-12")).toBe("Oct 12, 2026");
    expect(formatDate("2026-01-01")).toBe("Jan 1, 2026");
  });
});

describe("formatSalaryRange", () => {
  it("formats full and partial ranges", () => {
    expect(formatSalaryRange(80000, 95000, "USD")).toBe("$80,000 – $95,000");
    expect(formatSalaryRange(80000, null, "USD")).toBe("From $80,000");
    expect(formatSalaryRange(null, 95000, "EUR")).toBe("Up to €95,000");
    expect(formatSalaryRange(70000, 70000, "USD")).toBe("$70,000");
    expect(formatSalaryRange(null, null, "USD")).toBeNull();
  });

  it("falls back gracefully for unknown currency codes", () => {
    expect(formatSalaryRange(1000, null, "ZZZ")).toMatch(/1,000/);
  });
});
