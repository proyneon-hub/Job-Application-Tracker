"use client";

import { useRouter } from "next/navigation";

import { useApplications } from "@/lib/repository/applications-provider";

import { ApplicationForm } from "./application-form";
import { WithApplications } from "./data-states";

export function NewApplication() {
  const { createApplication } = useApplications();
  const router = useRouter();

  // Waits for the data to load so the resume picker has its options.
  return (
    <WithApplications>
      {(_applications, resumes) => (
        <ApplicationForm
          resumes={resumes}
          submitLabel="Add application"
          cancelHref="/applications"
          onSubmit={async (input) => {
            const created = await createApplication(input);
            router.push(`/applications/${created.id}`);
          }}
        />
      )}
    </WithApplications>
  );
}
