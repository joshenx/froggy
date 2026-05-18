create extension if not exists pgcrypto;

create table if not exists public.interested_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'froggy-landing',
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'hiring_manager', 'interviewer', 'recruiter')),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  level text not null check (level in ('junior', 'mid', 'senior', 'staff', 'manager')),
  created_at timestamptz not null default now()
);

create table if not exists public.interview_flows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  name text not null,
  version integer not null default 1,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.interview_stages (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references public.interview_flows (id) on delete cascade,
  name text not null,
  description text,
  order_index integer not null,
  canvas_x double precision not null default 40,
  canvas_y double precision not null default 70,
  duration_minutes integer not null default 45,
  interviewer_role text,
  axis_ids text[] not null default '{}',
  scoring_rules text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.evaluation_axes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text not null,
  positive_signals text[] not null default '{}',
  negative_signals text[] not null default '{}',
  anchored_bands text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.reference_companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  slug text not null,
  website text,
  logo_url text,
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  collection text not null,
  title text not null,
  prompt text not null,
  difficulty smallint not null check (difficulty between 1 and 5),
  seniority text not null check (seniority in ('junior', 'mid', 'senior', 'staff', 'manager')),
  levels text[] not null default '{}',
  axis_ids text[] not null default '{}',
  follow_ups text[] not null default '{}',
  expected_signals text[] not null default '{}',
  expected_duration_minutes integer not null default 15,
  role_family text not null,
  used_last_quarter integer not null default 0,
  signal_score numeric(5,2) not null default 0,
  rationale text not null default '',
  anchors text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.question_role_contexts (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  unique (question_id, role_id)
);

create table if not exists public.question_stage_attachments (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  stage_id uuid not null references public.interview_stages (id) on delete cascade,
  unique (question_id, stage_id)
);

create table if not exists public.question_company_tags (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  company_id uuid not null references public.reference_companies (id) on delete cascade,
  unique (question_id, company_id)
);

create table if not exists public.rubrics (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  axis_id text not null,
  score1 text not null,
  score2 text not null,
  score3 text not null,
  score4 text not null,
  score5 text not null
);

create table if not exists public.ats_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider text not null check (provider in ('ashby', 'greenhouse')),
  encrypted_credential text not null,
  status text not null default 'disabled' check (status in ('active', 'error', 'disabled')),
  capabilities jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, provider)
);

create table if not exists public.ats_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider text not null check (provider in ('ashby', 'greenhouse')),
  external_job_id text not null,
  name text not null,
  status text not null check (status in ('open', 'closed', 'draft')),
  unique (organization_id, provider, external_job_id)
);

create table if not exists public.ats_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider text not null check (provider in ('ashby', 'greenhouse')),
  external_stage_id text not null,
  external_job_id text not null,
  name text not null,
  order_index integer,
  unique (organization_id, provider, external_stage_id)
);

create table if not exists public.ats_job_mappings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider text not null check (provider in ('ashby', 'greenhouse')),
  external_job_id text not null,
  froggy_role_id uuid not null references public.roles (id) on delete cascade,
  froggy_flow_id uuid not null references public.interview_flows (id) on delete cascade,
  unique (organization_id, provider, external_job_id)
);

create table if not exists public.ats_stage_mappings (
  id uuid primary key default gen_random_uuid(),
  ats_job_mapping_id uuid not null references public.ats_job_mappings (id) on delete cascade,
  external_stage_id text not null,
  froggy_stage_id uuid not null references public.interview_stages (id) on delete cascade,
  unique (ats_job_mapping_id, external_stage_id)
);

create table if not exists public.candidate_applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider text not null check (provider in ('ashby', 'greenhouse')),
  external_candidate_id text not null,
  external_application_id text not null,
  external_job_id text not null,
  external_stage_id text not null,
  candidate_name text not null,
  candidate_email text,
  status text not null check (status in ('active', 'rejected', 'hired', 'withdrawn')),
  created_at timestamptz not null default now(),
  unique (organization_id, provider, external_application_id)
);

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  application_id uuid not null references public.candidate_applications (id) on delete cascade,
  froggy_stage_id uuid not null references public.interview_stages (id) on delete cascade,
  external_interview_id text,
  interviewer_user_id uuid,
  scheduled_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'in_progress', 'submitted', 'cancelled')),
  flow_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interview_session_question_snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions (id) on delete cascade,
  original_question_id uuid references public.questions (id) on delete set null,
  title_snapshot text not null,
  prompt_snapshot text not null,
  follow_ups_snapshot text[] not null default '{}',
  expected_signals_snapshot text[] not null default '{}',
  axis_ids_snapshot text[] not null default '{}',
  rubric_snapshots jsonb not null default '[]'::jsonb
);

create table if not exists public.scorecards (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.interview_sessions (id) on delete cascade,
  submitted_by_user_id uuid,
  recommendation text not null check (recommendation in ('strong_no', 'no', 'lean_no', 'lean_yes', 'yes', 'strong_yes')),
  confidence smallint not null check (confidence between 1 and 5),
  overall_notes text not null,
  submitted_at timestamptz not null default now(),
  locked boolean not null default false
);

create table if not exists public.scorecard_axis_scores (
  id uuid primary key default gen_random_uuid(),
  scorecard_id uuid not null references public.scorecards (id) on delete cascade,
  axis_id text not null,
  score smallint not null check (score between 1 and 5),
  evidence text not null
);

create table if not exists public.scorecard_question_notes (
  id uuid primary key default gen_random_uuid(),
  scorecard_id uuid not null references public.scorecards (id) on delete cascade,
  question_id uuid,
  notes text not null
);

create table if not exists public.ats_writeback_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  provider text not null check (provider in ('ashby', 'greenhouse')),
  scorecard_id uuid not null references public.scorecards (id) on delete cascade,
  external_candidate_id text not null,
  external_application_id text not null,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'retrying')),
  attempts integer not null default 0,
  mode text not null check (mode in ('structured_scorecard', 'candidate_note', 'pdf_attachment', 'copy_paste')),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

alter table public.interested_users enable row level security;
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.roles enable row level security;
alter table public.interview_flows enable row level security;
alter table public.interview_stages enable row level security;
alter table public.evaluation_axes enable row level security;
alter table public.reference_companies enable row level security;
alter table public.questions enable row level security;
alter table public.question_role_contexts enable row level security;
alter table public.question_stage_attachments enable row level security;
alter table public.question_company_tags enable row level security;
alter table public.rubrics enable row level security;
alter table public.ats_connections enable row level security;
alter table public.ats_jobs enable row level security;
alter table public.ats_stages enable row level security;
alter table public.ats_job_mappings enable row level security;
alter table public.ats_stage_mappings enable row level security;
alter table public.candidate_applications enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_session_question_snapshots enable row level security;
alter table public.scorecards enable row level security;
alter table public.scorecard_axis_scores enable row level security;
alter table public.scorecard_question_notes enable row level security;
alter table public.ats_writeback_jobs enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.has_org_access(target_org uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_memberships memberships
    where memberships.organization_id = target_org
      and memberships.user_id = auth.uid()
      and memberships.status = 'active'
  );
$$;

create or replace function public.has_org_role(target_org uuid, allowed_roles text[])
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_memberships memberships
    where memberships.organization_id = target_org
      and memberships.user_id = auth.uid()
      and memberships.status = 'active'
      and memberships.role = any (allowed_roles)
  );
$$;

drop policy if exists "Anyone can join Froggy waitlist" on public.interested_users;
create policy "Anyone can join Froggy waitlist"
  on public.interested_users
  for insert
  to anon
  with check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Members can read organizations" on public.organizations;
create policy "Members can read organizations"
  on public.organizations
  for select
  to authenticated
  using (public.has_org_access(id));

drop policy if exists "Users can read their memberships" on public.organization_memberships;
create policy "Users can read their memberships"
  on public.organization_memberships
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Admins can manage memberships" on public.organization_memberships;
create policy "Admins can manage memberships"
  on public.organization_memberships
  for all
  to authenticated
  using (public.has_org_role(organization_id, array['admin']))
  with check (public.has_org_role(organization_id, array['admin']));

create or replace function public.apply_org_read_write_policies(table_name text, org_column text)
returns void
language plpgsql
as $$
begin
  execute format('drop policy if exists "%1$s members can read" on public.%1$s', table_name);
  execute format(
    'create policy "%1$s members can read" on public.%1$s for select to authenticated using (public.has_org_access(%2$s))',
    table_name,
    org_column
  );
  execute format('drop policy if exists "%1$s editors can write" on public.%1$s', table_name);
  execute format(
    'create policy "%1$s editors can write" on public.%1$s for all to authenticated using (public.has_org_role(%2$s, array[''admin'',''hiring_manager'',''recruiter''])) with check (public.has_org_role(%2$s, array[''admin'',''hiring_manager'',''recruiter'']))',
    table_name,
    org_column
  );
end;
$$;

select public.apply_org_read_write_policies('roles', 'organization_id');
select public.apply_org_read_write_policies('interview_flows', 'organization_id');
select public.apply_org_read_write_policies('interview_stages', '(select organization_id from public.interview_flows where id = flow_id)');
select public.apply_org_read_write_policies('evaluation_axes', 'organization_id');
select public.apply_org_read_write_policies('reference_companies', 'organization_id');
select public.apply_org_read_write_policies('questions', 'organization_id');
select public.apply_org_read_write_policies('question_role_contexts', '(select organization_id from public.questions where id = question_id)');
select public.apply_org_read_write_policies('question_stage_attachments', '(select organization_id from public.questions where id = question_id)');
select public.apply_org_read_write_policies('question_company_tags', '(select organization_id from public.questions where id = question_id)');
select public.apply_org_read_write_policies('rubrics', '(select organization_id from public.questions where id = question_id)');
select public.apply_org_read_write_policies('ats_connections', 'organization_id');
select public.apply_org_read_write_policies('ats_jobs', 'organization_id');
select public.apply_org_read_write_policies('ats_stages', 'organization_id');
select public.apply_org_read_write_policies('ats_job_mappings', 'organization_id');
select public.apply_org_read_write_policies('ats_stage_mappings', '(select organization_id from public.ats_job_mappings where id = ats_job_mapping_id)');
select public.apply_org_read_write_policies('candidate_applications', 'organization_id');
select public.apply_org_read_write_policies('interview_sessions', 'organization_id');
select public.apply_org_read_write_policies('interview_session_question_snapshots', '(select organization_id from public.interview_sessions where id = session_id)');
select public.apply_org_read_write_policies('scorecards', '(select organization_id from public.interview_sessions where id = session_id)');
select public.apply_org_read_write_policies('scorecard_axis_scores', '(select organization_id from public.interview_sessions join public.scorecards on public.scorecards.session_id = public.interview_sessions.id where public.scorecards.id = scorecard_id)');
select public.apply_org_read_write_policies('scorecard_question_notes', '(select organization_id from public.interview_sessions join public.scorecards on public.scorecards.session_id = public.interview_sessions.id where public.scorecards.id = scorecard_id)');
select public.apply_org_read_write_policies('ats_writeback_jobs', 'organization_id');
select public.apply_org_read_write_policies('audit_logs', 'organization_id');

drop function if exists public.apply_org_read_write_policies(text, text);

insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view company logos" on storage.objects;
create policy "Anyone can view company logos"
  on storage.objects
  for select
  to public
  using (bucket_id = 'company-logos');

drop policy if exists "Admins can manage company logos" on storage.objects;
create policy "Admins can manage company logos"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'company-logos'
    and exists (
      select 1
      from public.organization_memberships memberships
      where memberships.user_id = auth.uid()
        and memberships.status = 'active'
        and memberships.role = 'admin'
    )
  )
  with check (
    bucket_id = 'company-logos'
    and exists (
      select 1
      from public.organization_memberships memberships
      where memberships.user_id = auth.uid()
        and memberships.status = 'active'
        and memberships.role = 'admin'
    )
  );
