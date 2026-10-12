import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";

/** Shared layout for the logged-out auth pages: a centered card. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12 outline-none"
    >
      <div className="absolute top-3 right-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="text-lg font-semibold tracking-tight">
        Job Application Tracker
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
