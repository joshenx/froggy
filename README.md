# Froggy

Froggy is a SaaS landing page for teams that want to create interview questions that identify their ideal candidate.

Built with Next.js, TypeScript, Tailwind CSS, and a Supabase-backed waitlist endpoint.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Add env vars locally and in Vercel:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Alternatively, use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the insert-only RLS policy in `supabase/schema.sql`.

## Scripts

```bash
npm run lint
npm run build
```
