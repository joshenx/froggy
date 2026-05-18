# Froggy

Froggy is a hiring design workspace for engineering teams. The app now includes:

- a PRD-shaped landing page and waitlist
- an invite-only product shell with magic-link Supabase auth
- a global question bank with company tagging and company-logo cataloging
- a React Flow stage canvas for interview flow layout
- seeded local fallback data for development and automated tests

## Local development

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

If Supabase auth env vars are missing, the app falls back to seeded dev personas on `/login` so product flows remain testable locally.

## Supabase setup

1. Create a Supabase project.
2. Run [supabase/schema.sql](/Users/SG3780/froggy/supabase/schema.sql).
3. Optionally run [supabase/seed.sql](/Users/SG3780/froggy/supabase/seed.sql) for starter org, axis, company, role, flow, and stage data.
4. Add env vars locally and in deployment:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

### Auth behavior

- Landing routes stay public.
- Product routes are protected by `src/proxy.ts`.
- In configured Supabase mode, `/login` sends a magic link.
- In no-env local mode, `/login` exposes seeded dev users for test and design work.

## Product notes

- Company logos upload to the `company-logos` Supabase bucket when service-role credentials are configured.
- The current local and test harness still uses the seeded JSON-backed workspace store for product data so browser and unit tests can run without a live Supabase project.
- The waitlist endpoint continues to write to Supabase.

## Scripts

```bash
npm run lint
npm run build
npm run test
```
