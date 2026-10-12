import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Follow-ups and stats arrive in a later phase. For now, manage your applications here:
      </p>
      <Button asChild className="w-fit">
        <Link href="/applications">View applications</Link>
      </Button>
    </div>
  );
}
