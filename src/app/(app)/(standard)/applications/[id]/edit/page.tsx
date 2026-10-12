import type { Metadata } from "next";

import { EditApplication } from "@/components/applications/edit-application";

export const metadata: Metadata = { title: "Edit application" };

export default async function EditApplicationPage({
  params,
}: PageProps<"/applications/[id]/edit">) {
  const { id } = await params;
  return (
    <div className="grid max-w-3xl gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit application</h1>
      <EditApplication id={id} />
    </div>
  );
}
