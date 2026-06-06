-- UNSTAGRAM — unread activity tracking. Run once in the SQL Editor.
alter table profiles
  add column if not exists activity_seen_at timestamptz not null default timestamptz 'epoch';
