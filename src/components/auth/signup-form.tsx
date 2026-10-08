"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { signUp } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/actions/form-state";

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialFormState);

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
      <FormField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters."
        errors={state.fieldErrors?.password}
      />
      <FormField
        name="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.confirmPassword}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  );
}
