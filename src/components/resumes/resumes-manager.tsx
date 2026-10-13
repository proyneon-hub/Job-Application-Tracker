"use client";

import { ExternalLink, FileText, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState, WithApplications } from "@/components/applications/data-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Application } from "@/lib/applications/types";
import { useApplications } from "@/lib/repository/applications-provider";
import type { Resume } from "@/lib/resumes/types";

import { DeleteResumeButton } from "./delete-resume-button";
import { ResumeForm } from "./resume-form";

/** The resume list, once data has loaded. */
export function ResumesSection() {
  return (
    <WithApplications>
      {(applications, resumes) => <ResumesManager applications={applications} resumes={resumes} />}
    </WithApplications>
  );
}

/** "new" while adding, a resume id while editing that resume, null otherwise. */
type Editing = "new" | string | null;

export function ResumesManager({
  applications,
  resumes,
}: {
  applications: Application[];
  resumes: Resume[];
}) {
  const { createResume, updateResume } = useApplications();
  const [editing, setEditing] = useState<Editing>(null);
  // Read out by screen readers after saves and deletes, since the form disappears.
  const [announcement, setAnnouncement] = useState("");

  const usage = new Map<string, number>();
  for (const app of applications) {
    if (app.resumeId) usage.set(app.resumeId, (usage.get(app.resumeId) ?? 0) + 1);
  }

  const addForm = (
    <Card>
      <CardContent>
        <ResumeForm
          submitLabel="Add resume"
          onCancel={() => setEditing(null)}
          onSubmit={async (input) => {
            const created = await createResume(input);
            setEditing(null);
            setAnnouncement(`Added ${created.name}.`);
          }}
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {editing === "new" ? (
        addForm
      ) : resumes.length > 0 ? (
        <div>
          <Button onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" />
            Add resume
          </Button>
        </div>
      ) : null}

      {resumes.length === 0 && editing !== "new" ? (
        <EmptyState
          title="No resumes yet"
          description="Add each version you send out, then pick it when you add an application. The dashboard will show which one gets the most replies."
          action={
            <Button onClick={() => setEditing("new")}>
              <Plus aria-hidden="true" />
              Add your first resume
            </Button>
          }
        />
      ) : null}

      <ul className="grid gap-4" aria-label="Your resumes">
        {resumes.map((resume) => {
          const usedBy = usage.get(resume.id) ?? 0;
          return (
            <li key={resume.id}>
              <Card>
                <CardContent>
                  {editing === resume.id ? (
                    <ResumeForm
                      initial={resume}
                      submitLabel="Save changes"
                      onCancel={() => setEditing(null)}
                      onSubmit={async (input) => {
                        const saved = await updateResume(resume.id, input);
                        setEditing(null);
                        setAnnouncement(`Saved ${saved.name}.`);
                      }}
                    />
                  ) : (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="grid min-w-0 gap-1">
                        <h2 className="flex items-center gap-2 font-semibold">
                          <FileText
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span className="break-words">{resume.name}</span>
                        </h2>
                        {resume.notes ? (
                          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {resume.notes}
                          </p>
                        ) : null}
                        <p className="text-sm">
                          {usedBy === 0 ? (
                            "Not used yet"
                          ) : (
                            <Link
                              href="/applications"
                              className="underline-offset-4 hover:underline"
                            >
                              Used in {usedBy} {usedBy === 1 ? "application" : "applications"}
                            </Link>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resume.linkUrl ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={resume.linkUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink aria-hidden="true" />
                              Open
                              <span className="sr-only"> {resume.name} (opens in a new tab)</span>
                            </a>
                          </Button>
                        ) : null}
                        <Button variant="outline" size="sm" onClick={() => setEditing(resume.id)}>
                          <Pencil aria-hidden="true" />
                          Edit<span className="sr-only"> {resume.name}</span>
                        </Button>
                        <DeleteResumeButton
                          resume={resume}
                          usedBy={usedBy}
                          onDeleted={() => setAnnouncement(`Deleted ${resume.name}.`)}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
