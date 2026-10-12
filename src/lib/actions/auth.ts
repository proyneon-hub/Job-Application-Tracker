"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { HOME_PATH, safeNextPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/lib/validation/auth";

import { toFieldErrors, type FormState } from "./form-state";

// Server Actions are public HTTP endpoints: anyone can call them with any data.
// So every action validates its input with Zod here, on the server, even though
// the forms also validate in the browser.

/** This site's origin, used to build links in emails (Supabase checks it against an allow-list). */
async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocol = h.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  const values = { email: String(formData.get("email") ?? "") };
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${await getOrigin()}/auth/confirm?next=${HOME_PATH}` },
  });

  if (error) {
    if (error.code === "weak_password") {
      return { fieldErrors: { password: [error.message] }, values };
    }
    return { error: "Couldn't create your account. Please try again.", values };
  }

  // If email confirmation is turned off in Supabase, the user is logged in straight away.
  if (data.session) {
    redirect(HOME_PATH);
  }

  // Supabase returns this same response whether or not the email is already registered,
  // so the form can't be used to find out who has an account.
  return { message: "Check your email for a link to confirm your account." };
}

export async function logIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  const values = { email: String(formData.get("email") ?? "") };
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error), values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Please confirm your email first. Check your inbox for the link.", values };
    }
    // Deliberately vague: don't reveal whether the email or the password was wrong.
    return { error: "Invalid email or password.", values };
  }

  redirect(safeNextPath(formData.get("next")?.toString()));
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      fieldErrors: toFieldErrors(parsed.error),
      values: { email: String(formData.get("email") ?? "") },
    };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await getOrigin()}/auth/confirm?next=/reset-password`,
  });

  // Same message whether or not the account exists (and even if sending failed),
  // so this form can't be used to discover who has an account.
  return { message: "If an account exists for that email, we've sent a password reset link." };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) {
    redirect("/login");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") {
      return { fieldErrors: { password: ["Choose a password you haven't used before."] } };
    }
    if (error.code === "weak_password") {
      return { fieldErrors: { password: [error.message] } };
    }
    return { error: "Couldn't update your password. Please try again." };
  }

  redirect(HOME_PATH);
}
