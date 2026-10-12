import { beforeEach, describe, expect, it } from "vitest";

import type { ApplicationInput } from "@/lib/applications/types";

import { createDemoRepository, DEMO_STORAGE_KEY } from "./demo-repository";
import { RepositoryError } from "./types";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
}

const input: ApplicationInput = {
  company: "Brand New Example Co",
  roleTitle: "Frontend Engineer",
  postingUrl: null,
  location: null,
  workMode: "remote",
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: "USD",
  source: null,
  status: "wishlist",
  dateApplied: null,
  nextFollowUp: null,
  contactName: null,
  contactEmail: null,
  notes: null,
};

let storage: MemoryStorage;
const makeRepo = () => createDemoRepository({ storage, today: "2026-10-12" });

beforeEach(() => {
  storage = new MemoryStorage();
});

describe("DemoRepository", () => {
  it("seeds the demo data on first use and saves it", async () => {
    const apps = await makeRepo().listApplications();
    expect(apps).toHaveLength(25);
    expect(storage.getItem(DEMO_STORAGE_KEY)).not.toBeNull();
  });

  it("records an initial status event when creating", async () => {
    const repo = makeRepo();
    const created = await repo.createApplication(input);
    const history = await repo.listStatusEvents(created.id);
    expect(history).toEqual([
      expect.objectContaining({
        fromStatus: null,
        toStatus: "wishlist",
        applicationId: created.id,
      }),
    ]);
  });

  it("records status changes, but not edits to other fields", async () => {
    const repo = makeRepo();
    const created = await repo.createApplication(input);
    await repo.updateApplication(created.id, { ...input, notes: "Updated notes" });
    await repo.updateStatus(created.id, "applied");
    await repo.updateApplication(created.id, { ...input, status: "screening" });

    const history = await repo.listStatusEvents(created.id);
    expect(history.map((e) => [e.fromStatus, e.toStatus])).toEqual([
      [null, "wishlist"],
      ["wishlist", "applied"],
      ["applied", "screening"],
    ]);
  });

  it("persists changes across repository instances (page reloads)", async () => {
    const created = await makeRepo().createApplication(input);
    const apps = await makeRepo().listApplications();
    expect(apps[0]?.id).toBe(created.id);
  });

  it("deletes an application together with its history", async () => {
    const repo = makeRepo();
    const [first] = await repo.listApplications();
    await repo.deleteApplication(first!.id);
    expect((await repo.listApplications()).some((a) => a.id === first!.id)).toBe(false);
    expect(await repo.listStatusEvents(first!.id)).toEqual([]);
  });

  it("validates input with the same rules as the server", async () => {
    const repo = makeRepo();
    const error = await repo.createApplication({ ...input, company: "" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RepositoryError);
    expect((error as RepositoryError).fieldErrors?.company).toBeDefined();

    await expect(repo.updateStatus("missing-id", "offer")).rejects.toThrow("doesn't exist");
    const [first] = await repo.listApplications();
    // @ts-expect-error: deliberately passing an invalid status, as a tampered client could.
    await expect(repo.updateStatus(first!.id, "hired")).rejects.toThrow("valid status");
  });

  it("keeps working in memory when storage is unavailable", async () => {
    const repo = createDemoRepository({ storage: null, today: "2026-10-12" });
    const created = await repo.createApplication(input);
    expect((await repo.listApplications())[0]?.id).toBe(created.id);
  });

  it("starts fresh when stored data is corrupted", async () => {
    storage.setItem(DEMO_STORAGE_KEY, "{not json");
    expect(await makeRepo().listApplications()).toHaveLength(25);
  });
});
