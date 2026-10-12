import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ApplicationsTableSection } from "@/components/applications/applications-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Applications" };

export default function ApplicationsPage() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <Button asChild>
          <Link href="/applications/new">
            <Plus aria-hidden="true" />
            Add application
          </Link>
        </Button>
      </div>
      <ApplicationsTableSection />
    </div>
  );
}
