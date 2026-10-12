"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";

import type { ApplicationStatus } from "@/lib/applications/constants";
import type { Application, ApplicationInput } from "@/lib/applications/types";

import { isDemoModeInBrowser } from "@/lib/demo/mode";

import { createDemoRepository, type DemoRepository } from "./demo-repository";
import { createSupabaseRepository } from "./supabase-repository";
import { RepositoryError, type ApplicationsRepository } from "./types";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; applications: Application[] };

type ApplicationsContextValue = {
  state: LoadState;
  repository: ApplicationsRepository;
  reload: () => void;
  createApplication: (input: ApplicationInput) => Promise<Application>;
  updateApplication: (id: string, input: ApplicationInput) => Promise<Application>;
  updateStatus: (id: string, status: ApplicationStatus) => Promise<Application>;
  deleteApplication: (id: string) => Promise<void>;
  /** Only in demo mode: go back to the original sample data. */
  resetDemo?: () => void;
};

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null);

/**
 * Loads the user's applications once and shares them with every page in the app,
 * keeping the list up to date as they're created, edited and deleted.
 *
 * Which repository it uses is decided here, so pages don't need to know whether
 * they're showing real data or demo data.
 */
export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  // The one place that decides between real and demo data. Data is only fetched
  // in the browser (in the effect below), so the server render never needs to know.
  const demoRepository = useMemo<DemoRepository | null>(
    () => (isDemoModeInBrowser() ? createDemoRepository() : null),
    [],
  );
  const repository = useMemo<ApplicationsRepository>(
    () => demoRepository ?? createSupabaseRepository(),
    [demoRepository],
  );
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [loadCount, setLoadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    repository
      .listApplications()
      .then((applications) => {
        if (!cancelled) setState({ status: "ready", applications });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message =
          error instanceof RepositoryError
            ? error.message
            : "Something went wrong loading your data.";
        setState({ status: "error", message });
      });
    return () => {
      cancelled = true;
    };
  }, [repository, loadCount]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setLoadCount((count) => count + 1);
  }, []);

  /** Applies a change to the loaded list (no-op while loading or after an error). */
  const updateList = useCallback((change: (applications: Application[]) => Application[]) => {
    setState((current) =>
      current.status === "ready"
        ? { status: "ready", applications: change(current.applications) }
        : current,
    );
  }, []);

  const replaceInList = useCallback(
    (saved: Application) => updateList((apps) => apps.map((a) => (a.id === saved.id ? saved : a))),
    [updateList],
  );

  const value = useMemo<ApplicationsContextValue>(
    () => ({
      state,
      repository,
      reload,
      resetDemo: demoRepository
        ? () => {
            demoRepository.reset();
            reload();
          }
        : undefined,
      async createApplication(input) {
        const created = await repository.createApplication(input);
        updateList((apps) => [created, ...apps]);
        return created;
      },
      async updateApplication(id, input) {
        const saved = await repository.updateApplication(id, input);
        replaceInList(saved);
        return saved;
      },
      async updateStatus(id, status) {
        // Optimistic update: move the card straight away so drag and drop feels
        // instant, then put it back if saving fails.
        let previous: Application | undefined;
        updateList((apps) =>
          apps.map((a) => {
            if (a.id !== id) return a;
            previous = a;
            return { ...a, status, updatedAt: new Date().toISOString() };
          }),
        );
        try {
          const saved = await repository.updateStatus(id, status);
          replaceInList(saved);
          return saved;
        } catch (error) {
          if (previous) replaceInList(previous);
          throw error;
        }
      },
      async deleteApplication(id) {
        await repository.deleteApplication(id);
        updateList((apps) => apps.filter((a) => a.id !== id));
      },
    }),
    [state, repository, demoRepository, reload, updateList, replaceInList],
  );

  return <ApplicationsContext value={value}>{children}</ApplicationsContext>;
}

export function useApplications() {
  const context = use(ApplicationsContext);
  if (!context) {
    throw new Error("useApplications must be used inside <ApplicationsProvider>.");
  }
  return context;
}
