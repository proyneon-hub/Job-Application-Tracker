"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { FieldShell, FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  WORK_MODE_LABELS,
  WORK_MODES,
} from "@/lib/applications/constants";
import type { Application, ApplicationInput } from "@/lib/applications/types";
import { toFieldErrors } from "@/lib/actions/form-state";
import { RepositoryError } from "@/lib/repository/types";
import { applicationFormSchema } from "@/lib/validation/application";

type FieldErrors = Record<string, string[] | undefined>;

type ApplicationFormProps = {
  /** The application being edited, or undefined when creating a new one. */
  initial?: Application;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (input: ApplicationInput) => Promise<unknown>;
};

/**
 * Create/edit form. Validates in the browser with the same Zod schema the server
 * uses, so most mistakes are caught instantly; anything the server rejects is
 * shown the same way.
 */
export function ApplicationForm({
  initial,
  submitLabel,
  cancelHref,
  onSubmit,
}: ApplicationFormProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const parsed = applicationFormSchema.safeParse(raw);
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error) ?? {});
      setFormError("Please fix the highlighted fields.");
      return;
    }

    setFieldErrors({});
    setFormError(undefined);
    startTransition(async () => {
      try {
        await onSubmit(parsed.data);
      } catch (error) {
        if (error instanceof RepositoryError) {
          setFieldErrors(error.fieldErrors ?? {});
          setFormError(error.message);
        } else {
          setFormError("Something went wrong. Please try again.");
        }
      }
    });
  }

  const errorsFor = (field: keyof ApplicationInput) => fieldErrors[field];

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-8">
      <FormAlert error={formError} />

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 text-base font-semibold">Role</legend>
        <FormField
          name="company"
          label="Company"
          required
          defaultValue={initial?.company}
          errors={errorsFor("company")}
        />
        <FormField
          name="roleTitle"
          label="Role title"
          required
          defaultValue={initial?.roleTitle}
          errors={errorsFor("roleTitle")}
        />
        <FormField
          name="postingUrl"
          label="Job posting link"
          type="url"
          inputMode="url"
          placeholder="https://"
          defaultValue={initial?.postingUrl ?? ""}
          errors={errorsFor("postingUrl")}
        />
        <FormField
          name="location"
          label="Location"
          defaultValue={initial?.location ?? ""}
          errors={errorsFor("location")}
        />
        <FieldShell id="workMode" label="Work mode" errors={errorsFor("workMode")}>
          {(props) => (
            <NativeSelect name="workMode" defaultValue={initial?.workMode ?? ""} {...props}>
              <option value="">Not specified</option>
              {WORK_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {WORK_MODE_LABELS[mode]}
                </option>
              ))}
            </NativeSelect>
          )}
        </FieldShell>
        <FormField
          name="source"
          label="Source"
          placeholder="Job board, referral, company site…"
          defaultValue={initial?.source ?? ""}
          errors={errorsFor("source")}
        />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-4 text-base font-semibold">Progress</legend>
        <FieldShell id="status" label="Status" errors={errorsFor("status")}>
          {(props) => (
            <NativeSelect name="status" defaultValue={initial?.status ?? "wishlist"} {...props}>
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </NativeSelect>
          )}
        </FieldShell>
        <FormField
          name="dateApplied"
          label="Date applied"
          type="date"
          defaultValue={initial?.dateApplied ?? ""}
          errors={errorsFor("dateApplied")}
        />
        <FormField
          name="nextFollowUp"
          label="Next follow-up"
          type="date"
          defaultValue={initial?.nextFollowUp ?? ""}
          errors={errorsFor("nextFollowUp")}
        />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-4 text-base font-semibold">Salary range</legend>
        <FormField
          name="salaryMin"
          label="Minimum"
          inputMode="numeric"
          defaultValue={initial?.salaryMin ?? ""}
          errors={errorsFor("salaryMin")}
        />
        <FormField
          name="salaryMax"
          label="Maximum"
          inputMode="numeric"
          defaultValue={initial?.salaryMax ?? ""}
          errors={errorsFor("salaryMax")}
        />
        <FormField
          name="salaryCurrency"
          label="Currency"
          maxLength={3}
          autoCapitalize="characters"
          hint="3-letter code, e.g. USD"
          defaultValue={initial?.salaryCurrency ?? "USD"}
          errors={errorsFor("salaryCurrency")}
        />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 text-base font-semibold">Contact</legend>
        <FormField
          name="contactName"
          label="Contact name"
          autoComplete="off"
          defaultValue={initial?.contactName ?? ""}
          errors={errorsFor("contactName")}
        />
        <FormField
          name="contactEmail"
          label="Contact email"
          type="email"
          autoComplete="off"
          defaultValue={initial?.contactEmail ?? ""}
          errors={errorsFor("contactEmail")}
        />
      </fieldset>

      <FieldShell id="notes" label="Notes" errors={errorsFor("notes")}>
        {(props) => (
          <Textarea name="notes" rows={5} defaultValue={initial?.notes ?? ""} {...props} />
        )}
      </FieldShell>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Button variant="outline" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
