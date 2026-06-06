-- UNSTAGRAM — Phase 2b: social features + coarse location.
-- Run once in the Supabase SQL Editor (after schema.sql).

-- coarse, opt-in location string on posts (e.g. "Anchorage, Alaska")
alter table posts add column if not exists location text;

-- likes
create table if not exists likes (
  user_id    uuid not null references profiles (id) on delete cascade,
  post_id    uuid not null references posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index if not exists likes_post_idx on likes (post_id);

-- reposts (shares)
create table if not exists reposts (
  user_id    uuid not null references profiles (id) on delete cascade,
  post_id    uuid not null references posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index if not exists reposts_post_idx on reposts (post_id);

alter table likes   enable row level security;
alter table reposts enable row level security;

drop policy if exists "likes read" on likes;
drop policy if exists "likes write own" on likes;
drop policy if exists "likes delete own" on likes;
create policy "likes read"       on likes for select to authenticated using (true);
create policy "likes write own"  on likes for insert to authenticated with check (user_id = auth.uid());
create policy "likes delete own" on likes for delete to authenticated using (user_id = auth.uid());

drop policy if exists "reposts read" on reposts;
drop policy if exists "reposts write own" on reposts;
drop policy if exists "reposts delete own" on reposts;
create policy "reposts read"       on reposts for select to authenticated using (true);
create policy "reposts write own"  on reposts for insert to authenticated with check (user_id = auth.uid());
create policy "reposts delete own" on reposts for delete to authenticated using (user_id = auth.uid());
