import type { Metadata } from "next";

import { DashboardSection } from "@/components/dashboard/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <DashboardSection />
    </div>
  );
}
