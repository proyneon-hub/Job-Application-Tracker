import { describe, expect, it } from "vitest";

import { applicationFormSchema, applicationInputSchema } from "./application";

const minimalForm = { company: "Example Widgets Ltd", roleTitle: "Frontend Engineer" };

describe("applicationFormSchema", () => {
  it("fills in defaults and turns blank fields into null", () => {
    const result = applicationFormSchema.parse({ ...minimalForm, location: "  ", notes: "" });
    expect(result).toMatchObject({
      company: "Example Widgets Ltd",
      roleTitle: "Frontend Engineer",
      status: "wishlist",
      salaryCurrency: "USD",
      location: null,
      notes: null,
      salaryMin: null,
      workMode: null,
    });
  });

  it("parses salaries written with commas and spaces", () => {
    const result = applicationFormSchema.parse({
      ...minimalForm,
      salaryMin: "85,000",
      salaryMax: " 95 000 ",
    });
    expect(result.salaryMin).toBe(85000);
    expect(result.salaryMax).toBe(95000);
  });

  it("rejects a salary range where max < min, on the max field", () => {
    const result = applicationFormSchema.safeParse({
      ...minimalForm,
      salaryMin: "90000",
      salaryMax: "80000",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path)).toEqual([["salaryMax"]]);
  });

  it("rejects non-numeric salaries", () => {
    const result = applicationFormSchema.safeParse({ ...minimalForm, salaryMin: "lots" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["salaryMin"]);
  });

  it("requires company and role title", () => {
    const result = applicationFormSchema.safeParse({ company: " ", roleTitle: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path[0]).sort()).toEqual(["company", "roleTitle"]);
  });

  it.each(["javascript:alert(1)", "ftp://example.test/job", "not a url"])(
    "rejects the unsafe or invalid posting URL %s",
    (postingUrl) => {
      const result = applicationFormSchema.safeParse({ ...minimalForm, postingUrl });
      expect(result.success).toBe(false);
    },
  );

  it("accepts an https posting URL", () => {
    const result = applicationFormSchema.parse({
      ...minimalForm,
      postingUrl: "https://jobs.example.test/123",
    });
    expect(result.postingUrl).toBe("https://jobs.example.test/123");
  });

  it("rejects unknown statuses, work modes and bad dates", () => {
    const result = applicationFormSchema.safeParse({
      ...minimalForm,
      status: "hired",
      workMode: "moon",
      dateApplied: "2026-02-30",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path[0]).sort()).toEqual([
      "dateApplied",
      "status",
      "workMode",
    ]);
  });
});

describe("applicationInputSchema", () => {
  it("rejects unexpected types sent straight to the server", () => {
    const result = applicationInputSchema.safeParse({ company: 42, roleTitle: ["x"] });
    expect(result.success).toBe(false);
  });
});
