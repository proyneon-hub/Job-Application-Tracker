"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  WORK_MODE_LABELS,
  WORK_MODES,
  type ApplicationStatus,
  type WorkMode,
} from "@/lib/applications/constants";
import {
  DEFAULT_FILTERS,
  filterApplications,
  hasActiveFilters,
  type ApplicationFilters,
  type DateSort,
} from "@/lib/applications/filter";
import type { Application } from "@/lib/applications/types";
import { formatDate } from "@/lib/format";

import { EmptyState, WithApplications } from "./data-states";
import { StatusBadge } from "./status-badge";

/** The table, once the applications have loaded. */
export function ApplicationsTableSection() {
  return (
    <WithApplications>
      {(applications) => <ApplicationsTable applications={applications} />}
    </WithApplications>
  );
}

export function ApplicationsTable({ applications }: { applications: Application[] }) {
  const [filters, setFilters] = useState<ApplicationFilters>(DEFAULT_FILTERS);
  const visible = filterApplications(applications, filters);

  const update = (change: Partial<ApplicationFilters>) => setFilters((f) => ({ ...f, ...change }));

  if (applications.length === 0) {
    return (
      <EmptyState
        title="No applications yet"
        description="Add the first job you're interested in. You can track it from wishlist to offer."
        action={
          <Button asChild>
            <Link href="/applications/new">Add application</Link>
          </Button>
        }
      />
    );
  }

  return (
    // grid-cols-1 (minmax(0, 1fr)) lets the table scroll sideways instead of widening the page.
    <div className="grid grid-cols-1 gap-4">
      <search className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
        <div className="grid gap-2">
          <Label htmlFor="filter-query">Search</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="filter-query"
              type="search"
              placeholder="Company, role, notes…"
              className="pl-9"
              value={filters.query}
              onChange={(e) => update({ query: e.target.value })}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="filter-status">Status</Label>
          <NativeSelect
            id="filter-status"
            value={filters.status}
            onChange={(e) => update({ status: e.target.value as ApplicationStatus | "all" })}
          >
            <option value="all">All statuses</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="filter-work-mode">Work mode</Label>
          <NativeSelect
            id="filter-work-mode"
            value={filters.workMode}
            onChange={(e) => update({ workMode: e.target.value as WorkMode | "all" })}
          >
            <option value="all">All work modes</option>
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {WORK_MODE_LABELS[mode]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="filter-sort">Date applied</Label>
          <NativeSelect
            id="filter-sort"
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value as DateSort })}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </NativeSelect>
        </div>
      </search>

      {/* Announces the result count to screen readers as filters change. */}
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {visible.length} of {applications.length}{" "}
        {applications.length === 1 ? "application" : "applications"}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          title="No matching applications"
          description="Try a different search or clear the filters."
          action={
            hasActiveFilters(filters) ? (
              <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Clear filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableCaption className="sr-only">Your job applications</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Company and role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Work mode</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="hidden sm:table-cell">Follow up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="pl-4">
                    <Link
                      href={`/applications/${app.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {app.company}
                    </Link>
                    <div className="max-w-64 truncate text-muted-foreground">{app.roleTitle}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={app.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {app.workMode ? WORK_MODE_LABELS[app.workMode] : "—"}
                  </TableCell>
                  <TableCell className="hidden max-w-48 truncate lg:table-cell">
                    {app.location ?? "—"}
                  </TableCell>
                  <TableCell>{app.dateApplied ? formatDate(app.dateApplied) : "—"}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {app.nextFollowUp ? formatDate(app.nextFollowUp) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
