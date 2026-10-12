"use client";

import { useRouter } from "next/navigation";

import { useApplications } from "@/lib/repository/applications-provider";

import { ApplicationForm } from "./application-form";

export function NewApplication() {
  const { createApplication } = useApplications();
  const router = useRouter();

  return (
    <ApplicationForm
      submitLabel="Add application"
      cancelHref="/applications"
      onSubmit={async (input) => {
        const created = await createApplication(input);
        router.push(`/applications/${created.id}`);
      }}
    />
  );
}
