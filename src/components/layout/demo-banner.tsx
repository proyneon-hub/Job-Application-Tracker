import { FlaskConical } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getVisitor } from "@/lib/auth/visitor";

import { ExitDemoButton } from "./exit-demo-button";
import { ResetDemoButton } from "./reset-demo-button";

/**
 * A clear strip across the top of every app page in demo mode, so nobody mistakes
 * the sample data for real data. Renders nothing for logged-in users.
 * Reads cookies, so render it inside <Suspense>.
 */
export async function DemoBanner() {
  const visitor = await getVisitor();
  if (visitor.kind !== "demo") return null;

  return (
    <section
      aria-label="Demo mode"
      className="border-b border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-50"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2">
        <p className="flex items-start gap-2 text-sm">
          <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Demo mode.</strong> You&apos;re exploring made-up
            sample data. Changes stay in this browser only.
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <ResetDemoButton />
          <Button asChild size="sm">
            <Link href="/signup">
              <span className="sm:hidden">Sign up</span>
              <span className="hidden sm:inline">Create an account</span>
            </Link>
          </Button>
          <ExitDemoButton />
        </div>
      </div>
    </section>
  );
}
