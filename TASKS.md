# TASKS

Working ledger for Froggy agents. Keep this current when changing product, UX, data capture, tests, or deployment.

## Pending decisions

- Decide whether to buy/attach a custom domain for Froggy.
- Decide whether to remove seeded test waitlist emails from Supabase before sharing publicly.
- Decide analytics/privacy approach before adding tracking beyond waitlist submissions.
- Decide when to remove the local dev-data fallback and require live Supabase-backed product data everywhere.

## Todo

- Replace the local MVP product-data fallback with live Supabase-backed repositories for all product routes.
- Add in-product invite and membership management for workspace admins.
- Add real Ashby/Greenhouse adapters and retryable write-back workers.
- Add question editing, versioning, and soft-delete instead of create-only flows.
- Add packet PDF export and a stronger ATS summary delivery path.
- Add responsive visual QA screenshots for both landing and product routes.

## Done

- Created public GitHub repo: https://github.com/joshenx/froggy
- Built Next.js + TypeScript + Tailwind landing page.
- Integrated Supabase waitlist collection via `/api/interested`.
- Created Supabase project `froggy` and table `public.interested_users`.
- Added Vercel production env vars for Supabase and deployed to production.
- Restyled the landing page toward the Exa reference with a green visual system.
- Replaced static benchmark bars with a Recharts-powered interactive question/evaluation axes explorer.
- Reworked the question explorer into a responsive question-to-signal module with richer axis notes and a Recharts-only chart.
- Migrated the waitlist form to React Hook Form with a TanStack Query mutation flow.
- Fixed navbar links so each item anchors to its own section.
- Added Playwright coverage for the landing page, nav anchors, chart switching, and waitlist form.
- Built a barebones Froggy MVP shell for roles, flow building, question bank management, ATS mappings, candidate sessions, interview scorecards, and packets.
- Added a local JSON-backed data layer plus route handlers for the MVP workflows.
- Added invite-only product auth with a Supabase magic-link path and local dev-login fallback.
- Added a company reference catalog, logo upload flow, and question-to-company tagging/filtering.
- Rebuilt the flow builder with a React Flow stage canvas and saved layout API.
- Expanded browser and unit coverage for auth, company tags, and saved flow layout behavior.
