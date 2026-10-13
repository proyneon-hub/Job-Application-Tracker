"use server";

import { z } from "zod";

import type { Resume } from "@/lib/resumes/types";
import { toResume, toResumeWrite } from "@/lib/repository/supabase-mapping";
import { createClient } from "@/lib/supabase/server";
import { resumeInputSchema } from "@/lib/validation/resume";

import { toFieldErrors } from "./form-state";
import type { ActionResult } from "./result";

// Resume writes for logged-in users. Same rules as applications.ts: check the
// session, parse every argument with Zod, and let row-level security limit the
// query to the user's own rows.

const idSchema = z.uuid();

const SESSION_EXPIRED = "Your session has expired. Please log in again.";
const NOT_FOUND = "That resume doesn't exist or was deleted.";
const SAVE_FAILED = "Couldn't save the resume. Please try again.";
const FIX_FIELDS = "Please fix the highlighted fields.";

/** Postgres error code for a unique constraint violation (here: a duplicate name). */
const UNIQUE_VIOLATION = "23505";

async function getClientForUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data ? supabase : null;
}

function saveError(code: string | undefined): ActionResult<never> {
  if (code === UNIQUE_VIOLATION) {
    return {
      ok: false,
      error: FIX_FIELDS,
      fieldErrors: { name: ["You already have a resume with that name."] },
    };
  }
  return { ok: false, error: SAVE_FAILED };
}

export async function createResume(input: unknown): Promise<ActionResult<Resume>> {
  const parsed = resumeInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: FIX_FIELDS, fieldErrors: toFieldErrors(parsed.error) };
  }
  const supabase = await getClientForUser();
  if (!supabase) return { ok: false, error: SESSION_EXPIRED };

  const { data, error } = await supabase
    .from("resumes")
    .insert(toResumeWrite(parsed.data))
    .select()
    .single();

  if (error) return saveError(error.code);
  return { ok: true, data: toResume(data) };
}

export async function updateResume(id: unknown, input: unknown): Promise<ActionResult<Resume>> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: NOT_FOUND };
  const parsed = resumeInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: FIX_FIELDS, fieldErrors: toFieldErrors(parsed.error) };
  }
  const supabase = await getClientForUser();
  if (!supabase) return { ok: false, error: SESSION_EXPIRED };

  const { data, error } = await supabase
    .from("resumes")
    .update(toResumeWrite(parsed.data))
    .eq("id", parsedId.data)
    .select()
    .maybeSingle();

  if (error) return saveError(error.code);
  if (!data) return { ok: false, error: NOT_FOUND };
  return { ok: true, data: toResume(data) };
}

export async function deleteResume(id: unknown): Promise<ActionResult<null>> {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: NOT_FOUND };
  const supabase = await getClientForUser();
  if (!supabase) return { ok: false, error: SESSION_EXPIRED };

  // The foreign key clears resume_id on the applications that used it.
  const { error } = await supabase.from("resumes").delete().eq("id", parsedId.data);
  if (error) return { ok: false, error: "Couldn't delete the resume. Please try again." };
  return { ok: true, data: null };
}
