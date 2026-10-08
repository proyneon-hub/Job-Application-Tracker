"use client";

import { useActionState } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { updatePassword } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/actions/form-state";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialFormState);

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FormAlert error={state.error} />
      <FormField
        name="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters."
        errors={state.fieldErrors?.password}
      />
      <FormField
        name="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.confirmPassword}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
