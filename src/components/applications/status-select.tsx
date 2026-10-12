"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/applications/constants";
import type { Application } from "@/lib/applications/types";
import { useApplications } from "@/lib/repository/applications-provider";
import { RepositoryError } from "@/lib/repository/types";

/** Quick status change on the detail page. The change is saved straight away. */
export function StatusSelect({ application }: { application: Application }) {
  const { updateStatus } = useApplications();
  const [error, setError] = useState<string>();

  function handleChange(status: ApplicationStatus) {
    setError(undefined);
    updateStatus(application.id, status).catch((e: unknown) =>
      setError(e instanceof RepositoryError ? e.message : "Couldn't change the status."),
    );
  }

  return (
    <div className="grid w-full max-w-56 gap-2">
      <Label htmlFor="quick-status">Status</Label>
      <NativeSelect
        id="quick-status"
        value={application.status}
        onChange={(e) => handleChange(e.target.value as ApplicationStatus)}
      >
        {APPLICATION_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </NativeSelect>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
