-- UNSTAGRAM — captions + comment likes + threaded replies. Run once in the SQL Editor.
alter table posts    add column if not exists caption text;
alter table comments add column if not exists parent_id uuid references comments (id) on delete cascade;
create index if not exists comments_parent_idx on comments (parent_id);

create table if not exists comment_likes (
  user_id    uuid not null references profiles (id) on delete cascade,
  comment_id uuid not null references comments (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);
create index if not exists comment_likes_cid_idx on comment_likes (comment_id);

alter table comment_likes enable row level security;
drop policy if exists "clikes read" on comment_likes;
drop policy if exists "clikes write own" on comment_likes;
drop policy if exists "clikes delete own" on comment_likes;
create policy "clikes read"       on comment_likes for select to authenticated using (true);
create policy "clikes write own"  on comment_likes for insert to authenticated with check (user_id = auth.uid());
create policy "clikes delete own" on comment_likes for delete to authenticated using (user_id = auth.uid());
