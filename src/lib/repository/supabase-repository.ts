import {
  createApplication,
  deleteApplication,
  updateApplication,
  updateApplicationStatus,
} from "@/lib/actions/applications";
import type { ActionResult } from "@/lib/actions/result";
import { createResume, deleteResume, updateResume } from "@/lib/actions/resumes";
import { createClient } from "@/lib/supabase/client";

import { toApplication, toResume, toStatusEvent } from "./supabase-mapping";
import { RepositoryError, type ApplicationsRepository } from "./types";

const LOAD_FAILED = "Couldn't load your applications. Check your connection and try again.";

function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new RepositoryError(result.error, result.fieldErrors);
  return result.data;
}

/**
 * Real-account implementation.
 *
 * Reads use the browser Supabase client directly: row-level security means the
 * database only ever returns the logged-in user's rows. Writes go through Server
 * Actions so they're validated with Zod on the server before reaching the database.
 */
export function createSupabaseRepository(): ApplicationsRepository {
  const supabase = createClient();

  return {
    async listApplications() {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new RepositoryError(LOAD_FAILED);
      return data.map(toApplication);
    },

    async listStatusEvents(applicationId) {
      let query = supabase.from("status_events").select("*");
      if (applicationId) query = query.eq("application_id", applicationId);
      const { data, error } = await query
        .order("changed_at", { ascending: true })
        .order("id", { ascending: true });
      if (error) throw new RepositoryError(LOAD_FAILED);
      return data.map(toStatusEvent);
    },

    async listResumes() {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw new RepositoryError(LOAD_FAILED);
      return data.map(toResume);
    },

    async createApplication(input) {
      return unwrap(await createApplication(input));
    },

    async updateApplication(id, input) {
      return unwrap(await updateApplication(id, input));
    },

    async updateStatus(id, status) {
      return unwrap(await updateApplicationStatus(id, status));
    },

    async deleteApplication(id) {
      unwrap(await deleteApplication(id));
    },

    async createResume(input) {
      return unwrap(await createResume(input));
    },

    async updateResume(id, input) {
      return unwrap(await updateResume(id, input));
    },

    async deleteResume(id) {
      unwrap(await deleteResume(id));
    },
  };
}
