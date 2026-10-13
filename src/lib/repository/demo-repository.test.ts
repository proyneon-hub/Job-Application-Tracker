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
  resumeId: null,
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

  it("reset() throws away changes and restores the original sample data", async () => {
    const repo = makeRepo();
    const original = await repo.listApplications();
    await repo.deleteApplication(original[0]!.id);
    await repo.createApplication(input);

    repo.reset();

    expect(storage.getItem(DEMO_STORAGE_KEY)).toBeNull();
    expect(await repo.listApplications()).toEqual(original);
  });

  it("drops demo data saved by an older version and re-seeds", async () => {
    storage.setItem("jat-demo-v1", JSON.stringify({ applications: [], events: [] }));
    expect(await makeRepo().listApplications()).toHaveLength(25);
    expect(storage.getItem("jat-demo-v1")).toBeNull();
  });
});

describe("DemoRepository resumes", () => {
  const resumeInput = { name: "Backend – v1", linkUrl: null, notes: null };

  it("seeds resumes that the sample applications link to", async () => {
    const repo = makeRepo();
    const resumes = await repo.listResumes();
    expect(resumes.map((r) => r.name)).toEqual([
      "Data & analytics – v1",
      "Frontend focus – v3",
      "General – v2",
    ]);
    const ids = new Set(resumes.map((r) => r.id));
    const linked = (await repo.listApplications()).filter((a) => a.resumeId !== null);
    expect(linked.length).toBeGreaterThan(0);
    expect(linked.every((a) => ids.has(a.resumeId!))).toBe(true);
  });

  it("creates, renames and lists resumes", async () => {
    const repo = makeRepo();
    const created = await repo.createResume(resumeInput);
    const renamed = await repo.updateResume(created.id, { ...resumeInput, name: "Backend – v2" });
    expect(renamed.name).toBe("Backend – v2");
    expect((await makeRepo().listResumes()).some((r) => r.id === created.id)).toBe(true);
  });

  it("rejects a duplicate name, like the database's unique constraint", async () => {
    const repo = makeRepo();
    const error = await repo
      .createResume({ ...resumeInput, name: "General – v2" })
      .catch((e: unknown) => e);
    expect((error as RepositoryError).fieldErrors?.name).toEqual([
      "You already have a resume with that name.",
    ]);
    // Saving a resume under its own name is fine.
    const [first] = await repo.listResumes();
    await expect(
      repo.updateResume(first!.id, { ...first!, notes: "Edited" }),
    ).resolves.toBeDefined();
  });

  it("only links applications to resumes that exist", async () => {
    const repo = makeRepo();
    const [resume] = await repo.listResumes();
    const linked = await repo.createApplication({ ...input, resumeId: resume!.id });
    expect(linked.resumeId).toBe(resume!.id);

    const error = await repo
      .createApplication({ ...input, resumeId: "00000000-0000-4000-8000-000000000000" })
      .catch((e: unknown) => e);
    expect((error as RepositoryError).fieldErrors?.resumeId).toBeDefined();
  });

  it("deleting a resume keeps its applications and clears their link", async () => {
    const repo = makeRepo();
    const [resume] = await repo.listResumes();
    const before = await repo.listApplications();
    const usedBy = before.filter((a) => a.resumeId === resume!.id).map((a) => a.id);
    expect(usedBy.length).toBeGreaterThan(0);

    await repo.deleteResume(resume!.id);

    const after = await repo.listApplications();
    expect(after).toHaveLength(before.length);
    expect(after.filter((a) => usedBy.includes(a.id)).every((a) => a.resumeId === null)).toBe(true);
    expect((await repo.listResumes()).some((r) => r.id === resume!.id)).toBe(false);
  });
});
