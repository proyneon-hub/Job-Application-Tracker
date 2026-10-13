"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { FieldShell, FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toFieldErrors } from "@/lib/actions/form-state";
import { RepositoryError } from "@/lib/repository/types";
import type { Resume, ResumeInput } from "@/lib/resumes/types";
import { resumeFormSchema } from "@/lib/validation/resume";

type FieldErrors = Record<string, string[] | undefined>;

type ResumeFormProps = {
  /** The resume being edited, or undefined when adding one. */
  initial?: Resume;
  submitLabel: string;
  onSubmit: (input: ResumeInput) => Promise<unknown>;
  onCancel: () => void;
};

/** Add/edit a resume version. Same validation flow as the application form. */
export function ResumeForm({ initial, submitLabel, onSubmit, onCancel }: ResumeFormProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  // The form opens because the user asked for it, so move focus straight into it.
  useEffect(() => nameRef.current?.focus(), []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const parsed = resumeFormSchema.safeParse(raw);
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

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label={initial ? `Edit ${initial.name}` : "Add a resume"}
      className="grid gap-4"
    >
      <FormAlert error={formError} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          ref={nameRef}
          name="name"
          label="Name"
          required
          placeholder="Frontend focus – v3"
          defaultValue={initial?.name}
          errors={fieldErrors.name}
        />
        <FormField
          name="linkUrl"
          label="Link to the file"
          type="url"
          inputMode="url"
          placeholder="https://"
          hint="Google Drive, Dropbox, etc. The file itself isn't uploaded here."
          defaultValue={initial?.linkUrl ?? ""}
          errors={fieldErrors.linkUrl}
        />
      </div>
      <FieldShell id="resume-notes" label="Notes" errors={fieldErrors.notes}>
        {(props) => (
          <Textarea
            name="notes"
            rows={3}
            placeholder="What's different about this version?"
            defaultValue={initial?.notes ?? ""}
            {...props}
          />
        )}
      </FieldShell>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
