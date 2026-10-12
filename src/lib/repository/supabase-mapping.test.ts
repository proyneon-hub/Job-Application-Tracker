import { describe, expect, it } from "vitest";

import { toApplication, toApplicationWrite } from "./supabase-mapping";

const row = {
  id: "11111111-1111-1111-1111-111111111111",
  user_id: "00000000-0000-0000-0000-00000000000a",
  company: "Example Widgets Ltd",
  role_title: "Frontend Engineer",
  posting_url: null,
  location: "Springfield",
  work_mode: "hybrid" as const,
  salary_min: 80000,
  salary_max: 90000,
  salary_currency: "USD",
  source: "Referral",
  status: "applied" as const,
  date_applied: "2026-10-01",
  next_follow_up: null,
  contact_name: null,
  contact_email: null,
  notes: null,
  created_at: "2026-10-01T09:00:00Z",
  updated_at: "2026-10-01T09:00:00Z",
};

describe("supabase mapping", () => {
  it("round-trips an application without leaking user_id", () => {
    const app = toApplication(row);
    expect(app).not.toHaveProperty("user_id");
    expect(app).not.toHaveProperty("userId");

    const { id: _id, createdAt: _c, updatedAt: _u, ...input } = app;
    const write = toApplicationWrite(input);
    expect(write).not.toHaveProperty("user_id");
    const { id: _rowId, user_id: _owner, created_at: _rc, updated_at: _ru, ...expected } = row;
    expect(write).toEqual(expected);
  });
});
