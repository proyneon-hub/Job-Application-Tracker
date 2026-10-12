import Link from "next/link";
import { Suspense } from "react";

import { NavLinks } from "@/components/layout/nav-links";
import { UserMenu } from "@/components/layout/user-menu";
import { ApplicationsProvider } from "@/lib/repository/applications-provider";

/** Layout for every logged-in page. src/proxy.ts keeps logged-out visitors out. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <ApplicationsProvider>
      <div className="flex flex-1 flex-col">
        <header className="border-b">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
            <nav aria-label="Main" className="flex items-center gap-4 sm:gap-8">
              <Link href="/dashboard" className="hidden font-semibold tracking-tight sm:inline">
                Job Tracker
              </Link>
              {/* usePathname() is request-specific, so the links stream in after the static shell. */}
              <Suspense>
                <NavLinks />
              </Suspense>
            </nav>
            {/* The user menu reads the session cookie, so it streams in after the static shell. */}
            <Suspense fallback={<div className="h-8 w-20" />}>
              <UserMenu />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      </div>
    </ApplicationsProvider>
  );
}
