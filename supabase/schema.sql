create table if not exists public.interested_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'froggy-landing',
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

alter table public.interested_users enable row level security;

-- If using NEXT_PUBLIC_SUPABASE_ANON_KEY directly from the server route,
-- this policy lets anonymous users insert waitlist emails without exposing reads.
create policy "Anyone can join Froggy waitlist"
  on public.interested_users
  for insert
  to anon
  with check (email ~* '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');

-- No select/update/delete policies are defined; public clients cannot read the list.
