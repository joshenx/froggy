# TODO

## Shipped in the barebones MVP

- Landing page + waitlist collection stay intact.
- Product auth now exists:
  - `/login`
  - `/auth/callback`
  - `/auth/logout`
  - `src/proxy.ts` protected product routes
- Product shell now exists for:
  - `/questions`
  - `/roles`
  - `/roles/[roleId]/flow`
  - `/roles/[roleId]/questions`
  - `/companies`
  - `/settings/integrations`
  - `/integrations/[provider]/mapping`
  - `/candidates`
  - `/candidates/[candidateId]`
  - `/interviews/[sessionId]`
  - `/packets/[applicationId]`
- Local JSON-backed mock persistence powers flows, stages, questions, mappings, sessions, scorecards, packets, and audit logs.
- Reference companies and question-to-company tagging now exist, including logo upload support with a Supabase-bucket path and local fallback.
- The role flow page now uses a React Flow stage canvas with saved layout metadata.
- RHF + TanStack Query are used for the new product forms and mutations.
- REST-style route handlers exist for the MVP flow creation, question creation, ATS connection/mapping, session creation, guide fetch, scorecard submission, and packet fetch.
- Supabase schema now covers auth-aware product tables, company references, and storage-bucket policies.

## Next product steps

- Replace the local JSON product fallback with live Supabase-backed product reads and writes.
- Add in-product invite management on top of organization memberships.
- Add question versioning, soft-delete, and edit history.
- Support axis/rubric editing from the UI instead of seeded axes only.
- Add real Ashby/Greenhouse adapters with retryable sync/write-back jobs.
- Add packet PDF generation and ATS attachment fallback.
- Persist immutable question snapshots across question edits and flow version bumps.
- Add explicit reopen controls for locked scorecards.
- Add richer audit log filters and actor metadata.

## Product risks to address

- Static seed data is still fine for demo/test mode, but the product data path still needs a full Supabase cutover for multi-user production use.
- The testing reset route is disabled in production, but the app still needs stronger environment separation before public deployment.
- ATS write-back is simulated right now; failure handling, retry policy, and provider capability differences still need real worker infrastructure.
