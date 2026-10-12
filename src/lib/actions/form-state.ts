import type { z } from "zod";

/** What a form's Server Action sends back to the form after it runs. */
export type FormState = {
  /** A message for the whole form, e.g. "Invalid email or password." */
  error?: string;
  /** A success message, e.g. "Check your email." */
  message?: string;
  /** Validation errors keyed by field name. */
  fieldErrors?: Record<string, string[] | undefined>;
  /** Values to put back into the form after an error (never passwords). */
  values?: Record<string, string>;
};

export const initialFormState: FormState = {};

/** Turns a failed Zod parse into per-field error messages. */
export function toFieldErrors(error: z.ZodError): FormState["fieldErrors"] {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}
