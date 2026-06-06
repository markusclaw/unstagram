-- UNSTAGRAM — reports (lightweight moderation). Run once in the SQL Editor.
create table if not exists reports (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts (id) on delete cascade,
  reporter   uuid references profiles (id) on delete set null,
  reason     text,
  created_at timestamptz not null default now()
);
create index if not exists reports_post_idx on reports (post_id);

alter table reports enable row level security;

-- Signed-in users can file a report. Nobody can read them via the API
-- (no select policy = locked); review them in the Supabase Table Editor.
drop policy if exists "reports insert own" on reports;
create policy "reports insert own" on reports for insert to authenticated with check (reporter = auth.uid());
