"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { applicationsToCsv } from "@/lib/csv";
import { todayLocal } from "@/lib/dates";
import { useApplications } from "@/lib/repository/applications-provider";

/**
 * Downloads all of the user's applications as a CSV file. Built entirely in the
 * browser from data already loaded, so it works the same for real and demo data
 * and nothing extra is sent to a server.
 */
export function ExportCsvButton() {
  const { state } = useApplications();
  const applications = state.status === "ready" ? state.applications : [];

  function download() {
    // The byte-order mark makes Excel read the file as UTF-8 (accents, € and so on).
    const blob = new Blob(["﻿", applicationsToCsv(applications)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `job-applications-${todayLocal()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" onClick={download} disabled={applications.length === 0}>
      <Download aria-hidden="true" />
      Export CSV
    </Button>
  );
}
