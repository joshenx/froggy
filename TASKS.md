# TASKS

Working ledger for Froggy agents. Keep this current when changing product, UX, data capture, tests, or deployment.

## Pending decisions

- Decide whether to buy/attach a custom domain for Froggy.
- Decide whether to remove seeded test waitlist emails from Supabase before sharing publicly.
- Decide analytics/privacy approach before adding tracking beyond waitlist submissions.

## Todo

- Add responsive visual QA screenshots for mobile and desktop.
- Add duplicate-email UX copy if Supabase upsert behavior changes.
- Add a lightweight success destination or confirmation email once early access flow is real.
- Consider adding a terms/privacy footer before broader launch.
- Review accessibility contrast after final brand palette is chosen.

## Done

- Created public GitHub repo: https://github.com/joshenx/froggy
- Built Next.js + TypeScript + Tailwind landing page.
- Integrated Supabase waitlist collection via `/api/interested`.
- Created Supabase project `froggy` and table `public.interested_users`.
- Added Vercel production env vars for Supabase and deployed to production.
- Restyled the landing page toward the Exa reference with a green visual system.
- Replaced static benchmark bars with a Recharts-powered interactive question/evaluation axes explorer.
- Fixed navbar links so each item anchors to its own section.
- Added Playwright coverage for the landing page, nav anchors, chart switching, and waitlist form.
