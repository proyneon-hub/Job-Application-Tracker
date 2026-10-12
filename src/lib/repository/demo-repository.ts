import type { ApplicationStatus } from "@/lib/applications/constants";
import type { Application, ApplicationInput, StatusEvent } from "@/lib/applications/types";
import { toFieldErrors } from "@/lib/actions/form-state";
import { todayLocal } from "@/lib/dates";
import { createDemoData, type DemoData } from "@/lib/demo/seed";
import { applicationInputSchema } from "@/lib/validation/application";

import { RepositoryError, type ApplicationsRepository } from "./types";

export const DEMO_STORAGE_KEY = "jat-demo-v1";

/** The bits of the Web Storage API we use, so tests can pass in a fake. */
type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function browserStorage(): KeyValueStorage | null {
  try {
    // Accessing localStorage can throw (e.g. some private browsing modes).
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Demo-mode implementation: everything lives in the visitor's own browser
 * (localStorage) and nothing is ever sent to a server or database.
 *
 * It behaves like the real thing on purpose: input is validated with the same Zod
 * schema the Server Actions use, and status history is recorded the same way the
 * database trigger does it.
 */
export function createDemoRepository(
  options: { storage?: KeyValueStorage | null; today?: string } = {},
): ApplicationsRepository {
  const storage = options.storage === undefined ? browserStorage() : options.storage;
  let memory: DemoData | null = null;

  function load(): DemoData {
    if (memory) return memory;
    const saved = storage?.getItem(DEMO_STORAGE_KEY);
    if (saved) {
      try {
        memory = JSON.parse(saved) as DemoData;
        return memory;
      } catch {
        // Corrupted data: fall through and start a fresh demo.
      }
    }
    memory = createDemoData(options.today ?? todayLocal());
    save(memory);
    return memory;
  }

  function save(data: DemoData) {
    memory = data;
    try {
      storage?.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage full or blocked: keep working in memory for this visit.
    }
  }

  function validate(input: unknown): ApplicationInput {
    const parsed = applicationInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new RepositoryError("Please fix the highlighted fields.", toFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  function findIndex(data: DemoData, id: string) {
    const index = data.applications.findIndex((a) => a.id === id);
    if (index === -1) throw new RepositoryError("That application doesn't exist or was deleted.");
    return index;
  }

  /** Mirrors private.record_status_event() in the database. */
  function statusEvent(
    applicationId: string,
    fromStatus: ApplicationStatus | null,
    toStatus: ApplicationStatus,
    changedAt: string,
  ): StatusEvent {
    return { id: crypto.randomUUID(), applicationId, fromStatus, toStatus, changedAt };
  }

  function saveChanges(id: string, changes: Partial<ApplicationInput>): Application {
    const data = load();
    const index = findIndex(data, id);
    const before = data.applications[index]!;
    const now = new Date().toISOString();
    const after: Application = { ...before, ...changes, updatedAt: now };

    const events =
      after.status !== before.status
        ? [...data.events, statusEvent(id, before.status, after.status, now)]
        : data.events;
    const applications = data.applications.with(index, after);
    save({ applications, events });
    return after;
  }

  return {
    async listApplications() {
      return load().applications.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async listStatusEvents(applicationId) {
      const events = load().events.filter(
        (e) => applicationId === undefined || e.applicationId === applicationId,
      );
      return events.toSorted((a, b) => a.changedAt.localeCompare(b.changedAt));
    },

    async createApplication(input) {
      const valid = validate(input);
      const data = load();
      const now = new Date().toISOString();
      const created: Application = {
        ...valid,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      save({
        applications: [created, ...data.applications],
        events: [...data.events, statusEvent(created.id, null, created.status, now)],
      });
      return created;
    },

    async updateApplication(id, input) {
      return saveChanges(id, validate(input));
    },

    async updateStatus(id, status) {
      const parsed = applicationInputSchema.shape.status.safeParse(status);
      if (!parsed.success) throw new RepositoryError("That isn't a valid status.");
      return saveChanges(id, { status: parsed.data });
    },

    async deleteApplication(id) {
      const data = load();
      findIndex(data, id);
      save({
        applications: data.applications.filter((a) => a.id !== id),
        events: data.events.filter((e) => e.applicationId !== id),
      });
    },
  };
}

/** Removes all demo data from this browser. */
export function clearDemoData() {
  try {
    browserStorage()?.removeItem(DEMO_STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
