import { BarChart3, BellRing, KanbanSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: KanbanSquare,
    title: "Kanban board",
    description:
      "See every application by stage and drag it forward. Works with a mouse, touch, or just the keyboard.",
  },
  {
    icon: BellRing,
    title: "Follow-up reminders",
    description:
      "Set a follow-up date and the dashboard lists what's due today and what's overdue, so nothing goes quiet.",
  },
  {
    icon: BarChart3,
    title: "Response-rate stats",
    description:
      "Applications per week, a stage-by-stage funnel, your response rate and how long replies take.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description:
      "Row-level security in the database means only you can read your data. The demo never leaves your browser.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-end px-4 pt-3">
        <ThemeToggle />
      </div>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 pt-16 pb-16 text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Job Application Tracker
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Track every application from wishlist to offer, with a kanban board, follow-up
            reminders, and response-rate stats.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
            {/* A plain form POST: works without JavaScript, and can't be triggered by link prefetching. */}
            <form action="/demo" method="post">
              <Button size="lg" variant="secondary" type="submit">
                Try the demo
              </Button>
            </form>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            The demo needs no account. Its sample data stays in your browser.
          </p>
        </section>

        <section aria-labelledby="features-heading" className="mx-auto w-full max-w-5xl px-4 pb-24">
          <h2 id="features-heading" className="sr-only">
            Features
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="grid content-start gap-2 rounded-xl border bg-card p-5">
                <Icon className="size-5" aria-hidden="true" />
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground">
          <p>Built with Next.js, Supabase and Tailwind CSS.</p>
          <a
            href="https://github.com/proyneon-hub/Job-Application-Tracker"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Source code on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
