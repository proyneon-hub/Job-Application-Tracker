import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Job Application Tracker</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Track every application from wishlist to offer, with a kanban board, follow-up reminders,
        and response-rate stats.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" asChild>
          <Link href="/signup">Get started</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    </main>
  );
}
