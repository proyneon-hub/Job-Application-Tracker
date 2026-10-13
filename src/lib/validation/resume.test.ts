import { describe, expect, it } from "vitest";

import { resumeFormSchema, resumeInputSchema } from "./resume";

describe("resumeInputSchema", () => {
  const valid = { name: "Frontend – v3", linkUrl: null, notes: null };

  it("accepts a name on its own", () => {
    expect(resumeInputSchema.parse(valid)).toEqual(valid);
  });

  it("requires a name of at most 100 characters", () => {
    expect(resumeInputSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
    expect(resumeInputSchema.safeParse({ ...valid, name: "x".repeat(101) }).success).toBe(false);
  });

  it("only accepts http(s) links", () => {
    const ok = { ...valid, linkUrl: "https://files.example.test/cv.pdf" };
    expect(resumeInputSchema.safeParse(ok).success).toBe(true);
    for (const linkUrl of ["javascript:alert(1)", "ftp://files.example.test/cv.pdf", "cv.pdf"]) {
      expect(resumeInputSchema.safeParse({ ...valid, linkUrl }).success).toBe(false);
    }
  });

  it("limits notes to 2000 characters", () => {
    expect(resumeInputSchema.safeParse({ ...valid, notes: "x".repeat(2001) }).success).toBe(false);
  });
});

describe("resumeFormSchema", () => {
  it("turns blank form fields into nulls", () => {
    expect(resumeFormSchema.parse({ name: " General ", linkUrl: " ", notes: "" })).toEqual({
      name: "General",
      linkUrl: null,
      notes: null,
    });
  });
});
