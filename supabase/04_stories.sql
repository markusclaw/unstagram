-- UNSTAGRAM — stories (ephemeral, 24h). Run once in the SQL Editor.
create table if not exists stories (
  id         uuid primary key default gen_random_uuid(),
  author     uuid not null references profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);
create index if not exists stories_active_idx on stories (expires_at);

alter table stories enable row level security;

drop policy if exists "stories read" on stories;
drop policy if exists "stories insert own" on stories;
drop policy if exists "stories delete own" on stories;
create policy "stories read"       on stories for select to authenticated using (true);
create policy "stories insert own" on stories for insert to authenticated with check (author = auth.uid());
create policy "stories delete own" on stories for delete to authenticated using (author = auth.uid());
