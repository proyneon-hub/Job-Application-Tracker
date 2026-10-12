import type { ApplicationStatus, WorkMode } from "@/lib/applications/constants";
import type { Application, StatusEvent } from "@/lib/applications/types";
import { addDays } from "@/lib/dates";

// Demo data for "Try the demo". Every company, person and email address here is
// invented (emails use the reserved .test domain). Dates are relative to "today"
// so the demo always has follow-ups due today and overdue.

type SeedEntry = {
  company: string;
  role: string;
  location: string | null;
  workMode: WorkMode | null;
  source: string | null;
  salary?: [number, number];
  /** Statuses this application has passed through, in order, with how many days ago each happened. */
  history: [ApplicationStatus, number][];
  /** Follow-up date relative to today (negative = overdue), if any. */
  followUp?: number;
  contact?: [string, string];
  notes?: string;
};

const ENTRIES: SeedEntry[] = [
  // Wishlist (4)
  {
    company: "Fictional Rockets Ltd",
    role: "Frontend Engineer",
    location: "Springfield",
    workMode: "hybrid",
    source: "Company website",
    salary: [95000, 115000],
    history: [["wishlist", 3]],
    notes: "Great design culture. Polish portfolio before applying.",
  },
  {
    company: "Daydream Design Studio",
    role: "UI Engineer",
    location: null,
    workMode: "remote",
    source: "Job board",
    history: [["wishlist", 1]],
  },
  {
    company: "Figment Energy",
    role: "Full-Stack Developer",
    location: "Riverton",
    workMode: "on_site",
    source: "Meetup",
    history: [["wishlist", 6]],
    followUp: 2,
  },
  {
    company: "Storybook Retail Group",
    role: "React Developer",
    location: "Fairview",
    workMode: "hybrid",
    source: "Referral",
    history: [["wishlist", 10]],
  },

  // Applied (6)
  {
    company: "Sample Paper Co",
    role: "Junior Software Engineer",
    location: "Lakeside",
    workMode: "hybrid",
    source: "Job board",
    salary: [70000, 82000],
    history: [
      ["wishlist", 20],
      ["applied", 15],
    ],
    followUp: 0,
    notes: "Follow up with the recruiter if no reply.",
  },
  {
    company: "Pretend Payments",
    role: "Frontend Developer",
    location: null,
    workMode: "remote",
    source: "LinkedIn",
    history: [["applied", 9]],
    followUp: -2,
  },
  {
    company: "Notareal Robotics",
    role: "Software Engineer, Tools",
    location: "Brookhaven",
    workMode: "on_site",
    source: "Company website",
    salary: [88000, 100000],
    history: [["applied", 4]],
    followUp: 6,
  },
  {
    company: "Hypothetical Hotels",
    role: "Web Developer",
    location: "Oakdale",
    workMode: "hybrid",
    source: "Job board",
    history: [
      ["wishlist", 12],
      ["applied", 11],
    ],
  },
  {
    company: "Lorem Ipsum Logistics",
    role: "TypeScript Developer",
    location: null,
    workMode: "remote",
    source: "Recruiter",
    history: [["applied", 2]],
    contact: ["Jordan Sample", "jordan.sample@example.test"],
  },
  {
    company: "Make-Believe Games",
    role: "Gameplay UI Programmer",
    location: "Maple Falls",
    workMode: "on_site",
    source: "Referral",
    history: [["applied", 26]],
    followUp: -5,
  },

  // Screening (4)
  {
    company: "Placeholder Analytics",
    role: "Data Visualization Engineer",
    location: null,
    workMode: "remote",
    source: "Job board",
    salary: [90000, 105000],
    history: [
      ["applied", 18],
      ["screening", 12],
    ],
    followUp: 1,
    contact: ["Sam Placeholder", "sam.placeholder@example.test"],
  },
  {
    company: "Imaginary Bank of Nowhere",
    role: "Frontend Engineer II",
    location: "Springfield",
    workMode: "hybrid",
    source: "Recruiter",
    history: [
      ["applied", 21],
      ["screening", 16],
    ],
    followUp: -1,
  },
  {
    company: "Mock Media Group",
    role: "Web Platform Engineer",
    location: "Riverton",
    workMode: "hybrid",
    source: "LinkedIn",
    history: [
      ["wishlist", 30],
      ["applied", 25],
      ["screening", 19],
    ],
  },
  {
    company: "Faux Foods Co",
    role: "Software Developer",
    location: "Lakeside",
    workMode: "on_site",
    source: "Career fair",
    history: [
      ["applied", 14],
      ["screening", 5],
    ],
    followUp: 3,
  },

  // Interview (4)
  {
    company: "Example Health Labs",
    role: "Frontend Engineer",
    location: null,
    workMode: "remote",
    source: "Referral",
    salary: [100000, 120000],
    history: [
      ["applied", 35],
      ["screening", 28],
      ["interview", 10],
    ],
    followUp: 0,
    contact: ["Riley Example", "riley.example@example.test"],
    notes: "Technical interview: build a small accessible form. Practise keyboard testing.",
  },
  {
    company: "Demo Dynamics Inc",
    role: "Product Engineer",
    location: "Fairview",
    workMode: "hybrid",
    source: "Company website",
    history: [
      ["applied", 30],
      ["screening", 24],
      ["interview", 8],
    ],
    followUp: 4,
  },
  {
    company: "Pseudo Systems",
    role: "Software Engineer",
    location: "Oakdale",
    workMode: "on_site",
    source: "Job board",
    salary: [85000, 98000],
    history: [
      ["wishlist", 45],
      ["applied", 40],
      ["screening", 33],
      ["interview", 20],
    ],
    followUp: -3,
  },
  {
    company: "Unreal Estate Partners",
    role: "Full-Stack Engineer",
    location: null,
    workMode: "remote",
    source: "Recruiter",
    history: [
      ["applied", 22],
      ["interview", 13],
    ],
  },

  // Offer (2)
  {
    company: "Test Fixture Aviation",
    role: "Frontend Engineer",
    location: "Brookhaven",
    workMode: "hybrid",
    source: "Referral",
    salary: [105000, 112000],
    history: [
      ["applied", 50],
      ["screening", 44],
      ["interview", 33],
      ["offer", 6],
    ],
    followUp: 1,
    notes: "Offer deadline next week. Compare benefits.",
  },
  {
    company: "Nonexistent Networks",
    role: "Software Engineer II",
    location: null,
    workMode: "remote",
    source: "LinkedIn",
    history: [
      ["applied", 42],
      ["screening", 37],
      ["interview", 25],
      ["offer", 9],
    ],
  },

  // Rejected (4)
  {
    company: "Made-Up Mobility",
    role: "React Native Developer",
    location: "Maple Falls",
    workMode: "on_site",
    source: "Job board",
    history: [
      ["applied", 38],
      ["rejected", 30],
    ],
  },
  {
    company: "Dummy Data Systems",
    role: "Frontend Developer",
    location: null,
    workMode: "remote",
    source: "Job board",
    history: [
      ["applied", 33],
      ["screening", 27],
      ["rejected", 21],
    ],
  },
  {
    company: "Invented Insurance",
    role: "Software Engineer",
    location: "Springfield",
    workMode: "hybrid",
    source: "Recruiter",
    history: [
      ["applied", 47],
      ["screening", 41],
      ["interview", 34],
      ["rejected", 28],
    ],
    notes: "Feedback: strong frontend, wanted more backend experience.",
  },
  {
    company: "Fake Plastic Trees Co",
    role: "Web Developer",
    location: "Riverton",
    workMode: "on_site",
    source: "Career fair",
    history: [
      ["applied", 55],
      ["rejected", 52],
    ],
  },

  // Withdrawn (1)
  {
    company: "Hollow Holdings",
    role: "Junior Developer",
    location: "Lakeside",
    workMode: "on_site",
    source: "Job board",
    history: [
      ["applied", 29],
      ["screening", 24],
      ["withdrawn", 17],
    ],
    notes: "Withdrew: role turned out to be mostly maintenance.",
  },
];

/** Deterministic, valid-looking UUID so seed ids are stable between page loads. */
function seedId(prefix: string, n: number) {
  return `${prefix}-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

/** Midday UTC on the given date, nudged by a few minutes so events keep their order. */
function timestampOn(date: string, minute: number) {
  return `${date}T12:${String(minute % 60).padStart(2, "0")}:00.000Z`;
}

export type DemoData = { applications: Application[]; events: StatusEvent[] };

/** Builds the demo dataset for the given "today" ("YYYY-MM-DD"). Pure: same input, same output. */
export function createDemoData(today: string): DemoData {
  const applications: Application[] = [];
  const events: StatusEvent[] = [];

  ENTRIES.forEach((entry, index) => {
    const id = seedId("de000000", index + 1);
    const steps = entry.history.map(([status, daysAgo], step) => ({
      status,
      at: timestampOn(addDays(today, -daysAgo), step),
      date: addDays(today, -daysAgo),
    }));
    const first = steps[0]!;
    const last = steps[steps.length - 1]!;
    const appliedStep = steps.find((s) => s.status === "applied");

    steps.forEach((step, i) => {
      events.push({
        id: seedId("de0e0000", events.length + 1),
        applicationId: id,
        fromStatus: i === 0 ? null : steps[i - 1]!.status,
        toStatus: step.status,
        changedAt: step.at,
      });
    });

    applications.push({
      id,
      company: entry.company,
      roleTitle: entry.role,
      postingUrl: `https://jobs.example.test/${index + 1}`,
      location: entry.location,
      workMode: entry.workMode,
      salaryMin: entry.salary?.[0] ?? null,
      salaryMax: entry.salary?.[1] ?? null,
      salaryCurrency: "USD",
      source: entry.source,
      status: last.status,
      dateApplied: appliedStep?.date ?? null,
      nextFollowUp: entry.followUp === undefined ? null : addDays(today, entry.followUp),
      contactName: entry.contact?.[0] ?? null,
      contactEmail: entry.contact?.[1] ?? null,
      notes: entry.notes ?? null,
      createdAt: first.at,
      updatedAt: last.at,
    });
  });

  return { applications, events };
}
