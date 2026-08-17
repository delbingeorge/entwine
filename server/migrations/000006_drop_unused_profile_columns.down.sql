alter table candidate_profiles
  add column years_experience int,
  add column desired_role_types text[] not null default '{}',
  add column motivations text,
  add column dealbreakers text,
  add column raw_intake jsonb;
