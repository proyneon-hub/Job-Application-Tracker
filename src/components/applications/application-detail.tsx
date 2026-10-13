"use client";

import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WORK_MODE_LABELS } from "@/lib/applications/constants";
import type { Application } from "@/lib/applications/types";
import type { Resume } from "@/lib/resumes/types";
import { formatDate, formatDateTime, formatSalaryRange } from "@/lib/format";

import { DeleteApplicationButton } from "./delete-application-button";
import { EmptyState, WithApplications } from "./data-states";
import { StatusBadge } from "./status-badge";
import { StatusSelect } from "./status-select";
import { StatusTimeline } from "./status-timeline";

export function ApplicationDetail({ id }: { id: string }) {
  return (
    <WithApplications>
      {(applications, resumes) => {
        const application = applications.find((a) => a.id === id);
        if (!application) return <NotFound />;
        const resume = resumes.find((r) => r.id === application.resumeId);
        return <Details application={application} resume={resume} />;
      }}
    </WithApplications>
  );
}

export function NotFound() {
  return (
    <EmptyState
      title="Application not found"
      description="It may have been deleted, or the link is wrong."
      action={
        <Button asChild variant="outline">
          <Link href="/applications">Back to applications</Link>
        </Button>
      }
    />
  );
}

function Details({ application: app, resume }: { application: Application; resume?: Resume }) {
  const salary = formatSalaryRange(app.salaryMin, app.salaryMax, app.salaryCurrency);

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Location", value: app.location },
    { label: "Work mode", value: app.workMode ? WORK_MODE_LABELS[app.workMode] : null },
    { label: "Salary", value: salary },
    { label: "Source", value: app.source },
    { label: "Date applied", value: app.dateApplied ? formatDate(app.dateApplied) : null },
    { label: "Next follow-up", value: app.nextFollowUp ? formatDate(app.nextFollowUp) : null },
    {
      label: "Resume",
      value: resume ? (
        resume.linkUrl ? (
          <a
            href={resume.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline underline-offset-4"
          >
            {resume.name}
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          resume.name
        )
      ) : null,
    },
    { label: "Contact", value: app.contactName },
    {
      label: "Contact email",
      value: app.contactEmail ? (
        <a href={`mailto:${app.contactEmail}`} className="underline underline-offset-4">
          {app.contactEmail}
        </a>
      ) : null,
    },
    {
      label: "Job posting",
      value: app.postingUrl ? (
        <a
          href={app.postingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 underline underline-offset-4"
        >
          View posting
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : null,
    },
  ];

  return (
    <article className="grid gap-8">
      <div className="grid gap-4">
        <Link
          href="/applications"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All applications
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">{app.roleTitle}</h1>
            <p className="text-lg text-muted-foreground">{app.company}</p>
            <StatusBadge status={app.status} className="mt-1" />
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/applications/${app.id}/edit`}>
                <Pencil aria-hidden="true" />
                Edit
              </Link>
            </Button>
            <DeleteApplicationButton application={app} />
          </div>
        </div>
      </div>

      <StatusSelect application={app} />

      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(({ label, value }) => (
          <div key={label} className="grid gap-1">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd>{value ?? <span className="text-muted-foreground">—</span>}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="notes-heading" className="grid gap-2">
        <h2 id="notes-heading" className="text-lg font-semibold">
          Notes
        </h2>
        {app.notes ? (
          // whitespace-pre-wrap keeps the user's line breaks. React escapes the text, so it's safe.
          <p className="whitespace-pre-wrap">{app.notes}</p>
        ) : (
          <p className="text-muted-foreground">No notes yet.</p>
        )}
      </section>

      <StatusTimeline application={app} />

      <p className="text-xs text-muted-foreground">
        Added {formatDateTime(app.createdAt)} · Last updated {formatDateTime(app.updatedAt)}
      </p>
    </article>
  );
}
