create table profile_experiences (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references candidate_profiles(id) on delete cascade,
  company         text not null,
  position        text not null,
  employment_type text,
  location        text,
  remote          text,
  start_date      date not null,
  end_date        date,
  summary         text,
  highlights      text[] not null default '{}',
  tech            text[] not null default '{}',
  source          text not null default 'manual',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index profile_experiences_profile_idx on profile_experiences (profile_id, start_date desc);
create index profile_experiences_tech_gin on profile_experiences using gin (tech);

create table profile_educations (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references candidate_profiles(id) on delete cascade,
  institution  text not null,
  area         text,
  study_type   text,
  start_date   date,
  end_date     date,
  score        text,
  source       text not null default 'manual',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index profile_educations_profile_idx on profile_educations (profile_id, end_date desc);

create table profile_skills (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references candidate_profiles(id) on delete cascade,
  name           text not null,
  canonical_name text not null,
  years          numeric(4,1),
  last_used      date,
  source         text not null default 'manual',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (profile_id, canonical_name)
);

create index profile_skills_canonical_idx on profile_skills (canonical_name);
