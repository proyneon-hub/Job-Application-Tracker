"use server";

import { z } from "zod";

import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/applications/constants";
import type { Application } from "@/lib/applications/types";
import { toApplication, toApplicationWrite } from "@/lib/repository/supabase-mapping";
import { createClient } from "@/lib/supabase/server";
import { applicationInputSchema } from "@/lib/validation/application";

import { toFieldErrors } from "./form-state";
import type { ActionResult } from "./result";

// Writes for logged-in users. Each action:
// 1. checks there is a session (Server Actions are public endpoints),
// 2. validates every argument with Zod (the browser could send anything),
// 3. queries as the user, so row-level security limits it to their own rows.
// Arguments are typed `unknown` on purpose: nothing is trusted until it's parsed.

const idSchema = z.uuid();
const statusSchema = z.enum(APPLICATION_STATUSES);

const SESSION_EXPIRED = "Your session has expired. Please log in again.";
const NOT_FOUND = "That application doesn't exist or was deleted.";
const SAVE_FAILED = "Couldn't save your changes. Please try again.";

/** Postgres error code for a foreign key violation: the chosen resume isn't one of the user's. */
const FOREIGN_KEY_VIOLATION = "23503";

function saveError(code: string | undefined): ActionResult<never> {
  if (code === FOREIGN_KEY_VIOLATION) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: { resumeId: ["That resume no longer exists. Choose another one."] },
    };
  }
  return { ok: false, error: SAVE_FAILED };
}

async function getClientForUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data ? supabase : null;
}

export async function createApplication(input: unknown): Promise<ActionResult<Application>> {
  const parsed = applicationInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  const supabase = await getClientForUser();
  if (!supabase) return { ok: false, error: SESSION_EXPIRED };

  const { data, error } = await supabase
    .from("applications")
    .insert(toApplicationWrite(parsed.data))
    .select()
    .single();

  if (error) return saveError(error.code);
  return { ok: true, data: toApplication(data) };
}

export async function updateApplication(
  id: unknown,
  input: unknown,
): Promise<ActionResult<Application>> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: NOT_FOUND };
  const parsed = applicationInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  const supabase = await getClientForUser();
  if (!supabase) return { ok: false, error: SESSION_EXPIRED };

  // RLS hides other users' rows, so updating someone else's id matches nothing
  // and maybeSingle() returns null: indistinguishable from "doesn't exist".
  const { data, error } = await supabase
    .from("applications")
    .update(toApplicationWrite(parsed.data))
    .eq("id", parsedId.data)
    .select()
    .maybeSingle();

  if (error) return saveError(error.code);
  if (!data) return { ok: false, error: NOT_FOUND };
  return { ok: true, data: toApplication(data) };
}

export async function updateApplicationStatus(
  id: unknown,
  status: unknown,
): Promise<ActionResult<Application>> {
  const parsedId = idSchema.safeParse(id);
  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedId.success) return { ok: false, error: NOT_FOUND };
  if (!parsedStatus.success) return { ok: false, error: "That isn't a valid status." };
  const supabase = await getClientForUser();
  if (!supabase) return { ok: false, error: SESSION_EXPIRED };

  const { data, error } = await supabase
    .from("applications")
    .update({ status: parsedStatus.data satisfies ApplicationStatus })
    .eq("id", parsedId.data)
    .select()
    .maybeSingle();

  if (error) return { ok: false, error: SAVE_FAILED };
  if (!data) return { ok: false, error: NOT_FOUND };
  return { ok: true, data: toApplication(data) };
}

export async function deleteApplication(id: unknown): Promise<ActionResult<null>> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: NOT_FOUND };
  const supabase = await getClientForUser();
  if (!supabase) return { ok: false, error: SESSION_EXPIRED };

  const { error } = await supabase.from("applications").delete().eq("id", parsedId.data);
  if (error) return { ok: false, error: "Couldn't delete the application. Please try again." };
  return { ok: true, data: null };
}
