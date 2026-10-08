# Job Application Tracker

A web app that helps job seekers track their applications from wishlist to offer: a kanban board, follow-up reminders, and response-rate stats.

> 🚧 Work in progress. The full README (live demo, screenshots, architecture, privacy and security) arrives in the final phase.

## Tech stack

Next.js (App Router) · TypeScript (strict) · Tailwind CSS + shadcn/ui · Supabase (Postgres + Auth) · Zod · Vitest · Playwright · GitHub Actions · Vercel

## Local development

Requires Node.js 22 (see `.nvmrc`).

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev                  # http://localhost:3000
```

| Script              | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the dev server                      |
| `npm run lint`      | ESLint                                    |
| `npm run typecheck` | Generate Next route types, then run `tsc` |
| `npm test`          | Unit tests (Vitest)                       |
| `npm run format`    | Format everything with Prettier           |
| `npm run build`     | Production build                          |
