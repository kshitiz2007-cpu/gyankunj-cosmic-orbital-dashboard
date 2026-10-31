# Gyankunj — Cosmic Orbital Dashboard

A standalone, mobile-first student dashboard concept for Gyankunj Academy.

## Design direction

- Cosmic orbital navigation with eight circular learning nodes
- Central knowledge hub and concentric orbital geometry
- Cinematic midnight palette with restrained glass depth
- Hindi-first editorial feature and daily practice progress
- Hugeicons iconography and Motion-powered interactions
- Responsive orbital composition and floating mobile dock

## Stack

- Next.js 15 App Router
- React 19 + TypeScript
- Tailwind CSS v4
- Motion for React
- Hugeicons React + Core Free Icons

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Supabase setup

1. Create a Supabase project and add the values from `.env.example` to your local environment and deployment provider.
2. Run the SQL migrations in `supabase/migrations` in ascending order (0001 through 0006) in the Supabase SQL Editor.
3. Configure the `study-resources` and `class-recordings` private storage buckets and publish content from the Admin Portal.
4. Set `OPENAI_API_KEY` as a server-only deployment environment variable to enable the AI Study Companion. Optionally set `OPENAI_MODEL`; the default is `gpt-4.1-mini`. Never prefix this key with `NEXT_PUBLIC_`.
5. Ensure the first administrator profile is assigned the `admin` role through a trusted Supabase SQL/admin process. Students must not be able to change their own role.

## Current integration status

- Home dashboard: live subjects, published editorial, announcements and account identity.
- Syllabus: student-specific completion persisted in `student_topic_progress`.
- Daily Drill and Mock Tests: published assessment content, server-side scoring, saved attempts and activity events.
- Progress and Profile: account-level learning metrics derived from saved attempts and activity.
- Study Library, Daily Editorials and Live Classes: published Supabase content.
- Admin Portal: live records for students, faculty, courses, batches, questions, tests, notifications and activity.
- AI Study Companion: authenticated server route; responses are grounded in published library resources and editorials.

## Local development

```bash
npm install
npm run dev
npm run build
```

Run the build before deploying. The SQL migrations are separate from the Next.js build and must be applied to the correct Supabase project.

## Branch

`feature/cosmic-orbital-dashboard`
