create table chat_threads (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  kind             text not null default 'main',
  parent_id        uuid references chat_threads(id) on delete cascade,
  title            text not null default '',
  status           text,
  last_message_at  timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index chat_threads_user_idx on chat_threads (user_id, last_message_at desc nulls last);
create index chat_threads_parent_idx on chat_threads (parent_id);

create table chat_messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references chat_threads(id) on delete cascade,
  seq         bigint not null,
  role        text not null,
  content     text not null,
  created_at  timestamptz not null default now(),
  unique (thread_id, seq)
);

create index chat_messages_thread_idx on chat_messages (thread_id, seq);
