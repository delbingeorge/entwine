create table candidate_profiles (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references users(id),
  seniority              text not null,
  years_experience       int,
  primary_stack          text[] not null default '{}',
  desired_role_types     text[] not null default '{}',
  locations              text[] not null default '{}',
  remote_pref            text not null,
  salary_expectation_min bigint,
  salary_currency        text,
  motivations            text,
  dealbreakers           text,
  wants_to_build         text,
  status                 text not null default 'draft',
  raw_intake             jsonb,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (user_id)
);

create index candidate_profiles_stack_gin on candidate_profiles using gin (primary_stack);
