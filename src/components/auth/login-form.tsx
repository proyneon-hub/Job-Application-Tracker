"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { logIn } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/actions/form-state";

const LINK_ERRORS: Record<string, string> = {
  link_invalid: "That link is invalid or has expired. Please try again.",
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(logIn, initialFormState);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const linkError = LINK_ERRORS[searchParams.get("error") ?? ""];

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FormAlert error={state.error ?? linkError} />
      <input type="hidden" name="next" value={next} />
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
        autoComplete="current-password"
        required
        errors={state.fieldErrors?.password}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="underline underline-offset-4">
          Forgot password?
        </Link>
        <Link href="/signup" className="underline underline-offset-4">
          Create an account
        </Link>
      </div>
    </form>
  );
}
