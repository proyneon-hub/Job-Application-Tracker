import type { Metadata } from "next";

import { NewApplication } from "@/components/applications/new-application";

export const metadata: Metadata = { title: "Add application" };

export default function NewApplicationPage() {
  return (
    <div className="grid max-w-3xl gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Add application</h1>
      <NewApplication />
    </div>
  );
}
