"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/actions/form-state";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialFormState);

  if (state.message) {
    return <FormAlert message={state.message} />;
  }

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FormAlert error={state.error} />
      <FormField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <Link href="/login" className="text-center text-sm underline underline-offset-4">
        Back to log in
      </Link>
    </form>
  );
}
