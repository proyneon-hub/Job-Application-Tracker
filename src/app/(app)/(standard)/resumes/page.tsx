import type { Metadata } from "next";

import { ResumesSection } from "@/components/resumes/resumes-manager";

export const metadata: Metadata = { title: "Resumes" };

export default function ResumesPage() {
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-6">
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Resumes</h1>
        <p className="text-muted-foreground">
          Keep a list of the resume versions you send out, and link each one to wherever the file
          lives. Pick the version on each application to see which one gets replies.
        </p>
      </div>
      <ResumesSection />
    </div>
  );
}
