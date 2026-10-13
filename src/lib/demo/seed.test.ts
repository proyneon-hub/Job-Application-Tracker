import { describe, expect, it } from "vitest";

import { APPLICATION_STATUSES } from "@/lib/applications/constants";
import { applicationInputSchema } from "@/lib/validation/application";

import { createDemoData } from "./seed";

const TODAY = "2026-10-12";
const { applications, events, resumes } = createDemoData(TODAY);

describe("createDemoData", () => {
  it("creates about 25 applications covering every status", () => {
    expect(applications).toHaveLength(25);
    const statuses = new Set(applications.map((a) => a.status));
    expect([...statuses].sort()).toEqual([...APPLICATION_STATUSES].sort());
  });

  it("produces data that passes the same validation as real input", () => {
    for (const { id: _id, createdAt: _c, updatedAt: _u, ...input } of applications) {
      expect(applicationInputSchema.safeParse(input).success).toBe(true);
    }
  });

  it("has unique ids", () => {
    expect(new Set(applications.map((a) => a.id)).size).toBe(applications.length);
    expect(new Set(events.map((e) => e.id)).size).toBe(events.length);
  });

  it("gives every application a consistent history ending in its current status", () => {
    for (const app of applications) {
      const history = events.filter((e) => e.applicationId === app.id);
      expect(history[0]?.fromStatus).toBeNull();
      history.slice(1).forEach((event, i) => {
        expect(event.fromStatus).toBe(history[i]?.toStatus);
        expect(event.changedAt > history[i]!.changedAt).toBe(true);
      });
      expect(history.at(-1)?.toStatus).toBe(app.status);
    }
  });

  it("always includes follow-ups due today and overdue", () => {
    const followUps = applications
      .map((a) => a.nextFollowUp)
      .filter((d): d is string => d !== null);
    expect(followUps).toContain(TODAY);
    expect(followUps.some((d) => d < TODAY)).toBe(true);
  });

  it("uses only reserved example domains for links and emails", () => {
    for (const app of applications) {
      if (app.contactEmail) expect(app.contactEmail).toMatch(/@example\.test$/);
      if (app.postingUrl) expect(new URL(app.postingUrl).hostname).toMatch(/\.test$/);
    }
  });

  it("links most sent applications to a seeded resume, and nothing else", () => {
    const ids = new Set(resumes.map((r) => r.id));
    const linked = applications.filter((a) => a.resumeId !== null);
    expect(linked.every((a) => ids.has(a.resumeId!))).toBe(true);
    expect(linked.length).toBeGreaterThan(applications.length / 2);
    expect(applications.some((a) => a.status !== "wishlist" && a.resumeId === null)).toBe(true);
    expect(applications.filter((a) => a.status === "wishlist").every((a) => !a.resumeId)).toBe(
      true,
    );
    for (const resume of resumes) {
      if (resume.linkUrl) expect(new URL(resume.linkUrl).hostname).toMatch(/\.test$/);
    }
  });

  it("is deterministic", () => {
    expect(createDemoData(TODAY)).toEqual(createDemoData(TODAY));
  });
});
