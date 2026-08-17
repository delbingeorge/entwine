alter table candidate_profiles
  add column primary_stack text[] not null default '{}',
  add column remote_pref text not null default 'any',
  add column wants_to_build text;

create index candidate_profiles_stack_gin on candidate_profiles using gin (primary_stack);
