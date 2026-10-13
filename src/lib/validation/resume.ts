import { z } from "zod";

import { blankToNull, optionalText, webLink } from "./application";

// Same two-schema pattern as application.ts: typed input, and raw form strings
// that are cleaned up and then checked by the typed schema.
// The limits mirror the CHECK constraints on the resumes table.

export const resumeInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give this resume a name, like “Frontend – v2”.")
    .max(100, "Use 100 characters or fewer."),
  linkUrl: webLink.nullable(),
  notes: optionalText(2000),
});

export const resumeFormSchema = z
  .object({
    name: z.string().default(""),
    linkUrl: blankToNull,
    notes: blankToNull,
  })
  .pipe(resumeInputSchema);

export type ResumeFormValues = z.input<typeof resumeFormSchema>;
