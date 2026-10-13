import Link from "next/link";
import { Suspense } from "react";

import { DemoBanner } from "@/components/layout/demo-banner";
import { NavLinks } from "@/components/layout/nav-links";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { ApplicationsProvider } from "@/lib/repository/applications-provider";

/** Layout for every logged-in page. src/proxy.ts keeps logged-out visitors out. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <ApplicationsProvider>
      <div className="flex flex-1 flex-col">
        {/* Reads the demo cookie, so it streams in after the static shell. */}
        <Suspense>
          <DemoBanner />
        </Suspense>
        <header className="border-b">
          {/* Phones: brand and actions on the first row, the nav links on a second row. */}
          <div className="flex w-full flex-wrap items-center justify-between gap-x-3 px-4 sm:h-14 sm:flex-nowrap">
            <Link
              href="/dashboard"
              className="flex h-12 items-center font-semibold tracking-tight sm:hidden"
            >
              Job Tracker
            </Link>
            <nav
              aria-label="Main"
              className="order-last flex h-10 w-full items-center gap-4 overflow-x-auto sm:order-none sm:h-auto sm:w-auto sm:gap-8"
            >
              <Link href="/dashboard" className="hidden font-semibold tracking-tight sm:inline">
                Job Tracker
              </Link>
              {/* usePathname() is request-specific, so the links stream in after the static shell. */}
              <Suspense>
                <NavLinks />
              </Suspense>
            </nav>
            {/* The user menu reads the session cookie, so it streams in after the static shell. */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Suspense fallback={<div className="h-8 w-20" />}>
                <UserMenu />
              </Suspense>
            </div>
          </div>
        </header>
        {/* Width is set per page group: see (standard)/layout.tsx. */}
        <main id="main" tabIndex={-1} className="w-full flex-1 px-4 py-6 outline-none">
          {children}
        </main>
      </div>
    </ApplicationsProvider>
  );
}
