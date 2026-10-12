"use client";

import { useRouter } from "next/navigation";

import { useApplications } from "@/lib/repository/applications-provider";

import { ApplicationForm } from "./application-form";
import { NotFound } from "./application-detail";
import { WithApplications } from "./data-states";

export function EditApplication({ id }: { id: string }) {
  const { updateApplication } = useApplications();
  const router = useRouter();

  return (
    <WithApplications>
      {(applications) => {
        const application = applications.find((a) => a.id === id);
        if (!application) return <NotFound />;
        return (
          <ApplicationForm
            initial={application}
            submitLabel="Save changes"
            cancelHref={`/applications/${id}`}
            onSubmit={async (input) => {
              await updateApplication(id, input);
              router.push(`/applications/${id}`);
            }}
          />
        );
      }}
    </WithApplications>
  );
}
