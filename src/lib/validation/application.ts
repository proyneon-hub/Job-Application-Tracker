import { z } from "zod";

import { APPLICATION_STATUSES, WORK_MODES } from "@/lib/applications/constants";

// Two schemas:
// - applicationInputSchema validates typed data (what the repository and Server Actions receive).
// - applicationFormSchema turns raw form strings into that typed data, then runs the same checks.
// The limits mirror the CHECK constraints in the database, so bad data is caught with a
// friendly message here before Postgres would reject it.

export const optionalText = (max: number) =>
  z.string().trim().max(max, `Use ${max} characters or fewer.`).nullable();

/** Only http(s) links, so a stored link can never be a `javascript:` URL. */
export const webLink = z
  .url({
    protocol: /^https?$/,
    message: "Enter a full link starting with http:// or https://.",
  })
  .max(2000, "That link is too long.");

const isoDate = z.iso.date("Use a valid date.").nullable();

const salary = z
  .number("Enter a whole number.")
  .int("Enter a whole number.")
  .min(0, "Salary can't be negative.")
  .max(100_000_000, "That number is too large.")
  .nullable();

export const applicationInputSchema = z
  .object({
    company: z
      .string()
      .trim()
      .min(1, "Enter the company name.")
      .max(200, "Use 200 characters or fewer."),
    roleTitle: z
      .string()
      .trim()
      .min(1, "Enter the role title.")
      .max(200, "Use 200 characters or fewer."),
    postingUrl: webLink.nullable(),
    location: optionalText(200),
    workMode: z.enum(WORK_MODES, "Choose a work mode.").nullable(),
    salaryMin: salary,
    salaryMax: salary,
    salaryCurrency: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{3}$/, "Use a 3-letter currency code, like USD."),
    source: optionalText(200),
    status: z.enum(APPLICATION_STATUSES, "Choose a status."),
    dateApplied: isoDate,
    nextFollowUp: isoDate,
    contactName: optionalText(200),
    contactEmail: z.email("Enter a valid email address.").max(320).nullable(),
    notes: optionalText(5000),
    resumeId: z.uuid("Choose a resume from the list.").nullable(),
  })
  .refine((a) => a.salaryMin === null || a.salaryMax === null || a.salaryMin <= a.salaryMax, {
    message: "The maximum must be at least the minimum.",
    path: ["salaryMax"],
  });

/** "" or whitespace -> null, otherwise the trimmed string. */
export const blankToNull = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim() ?? "";
    return trimmed === "" ? null : trimmed;
  });

/** "" -> null, "85,000" -> 85000, "abc" -> NaN (which the number check then rejects). */
const blankToNumber = z
  .string()
  .optional()
  .transform((value) => {
    const cleaned = value?.replace(/[,\s]/g, "") ?? "";
    return cleaned === "" ? null : Number(cleaned);
  });

export const applicationFormSchema = z
  .object({
    company: z.string().default(""),
    roleTitle: z.string().default(""),
    postingUrl: blankToNull,
    location: blankToNull,
    workMode: blankToNull,
    salaryMin: blankToNumber,
    salaryMax: blankToNumber,
    salaryCurrency: z
      .string()
      .optional()
      .transform((value) => value?.trim() || "USD"),
    source: blankToNull,
    status: z.string().default("wishlist"),
    dateApplied: blankToNull,
    nextFollowUp: blankToNull,
    contactName: blankToNull,
    contactEmail: blankToNull,
    notes: blankToNull,
    resumeId: blankToNull,
  })
  .pipe(applicationInputSchema);

export type ApplicationFormValues = z.input<typeof applicationFormSchema>;
