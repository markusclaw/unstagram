-- UNSTAGRAM — Supabase schema (run once in the SQL Editor).
-- Tables, row-level security, signup trigger, and invite-code functions.

-- ---------- tables ----------
create table if not exists profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique not null,
  display_name text,
  bio          text default '',
  created_at   timestamptz not null default now()
);

create table if not exists posts (
  id         uuid primary key default gen_random_uuid(),
  author     uuid not null references profiles (id) on delete cascade,
  prose      text not null,
  created_at timestamptz not null default now()
);
create index if not exists posts_created_idx on posts (created_at desc);
create index if not exists posts_author_idx on posts (author);

create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts (id) on delete cascade,
  author     uuid not null references profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on comments (post_id, created_at);

create table if not exists follows (
  follower  uuid not null references profiles (id) on delete cascade,
  following uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower, following)
);

create table if not exists invite_codes (
  code       text primary key,
  used       boolean not null default false,
  used_by    uuid references auth.users (id),
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- row-level security ----------
alter table profiles     enable row level security;
alter table posts        enable row level security;
alter table comments     enable row level security;
alter table follows      enable row level security;
alter table invite_codes enable row level security;  -- no policies = locked; only RPCs touch it

-- profiles: world-readable, you can edit your own
drop policy if exists "profiles read"  on profiles;
drop policy if exists "profiles update own" on profiles;
create policy "profiles read"       on profiles for select using (true);
create policy "profiles update own" on profiles for update using (auth.uid() = id);

-- posts: any signed-in user can read; you write/delete your own
drop policy if exists "posts read" on posts;
drop policy if exists "posts insert own" on posts;
drop policy if exists "posts delete own" on posts;
create policy "posts read"       on posts for select to authenticated using (true);
create policy "posts insert own" on posts for insert to authenticated with check (author = auth.uid());
create policy "posts delete own" on posts for delete to authenticated using (author = auth.uid());

-- comments: signed-in read; write your own
drop policy if exists "comments read" on comments;
drop policy if exists "comments insert own" on comments;
create policy "comments read"       on comments for select to authenticated using (true);
create policy "comments insert own" on comments for insert to authenticated with check (author = auth.uid());

-- follows: signed-in read; manage your own
drop policy if exists "follows read" on follows;
drop policy if exists "follows write own" on follows;
drop policy if exists "follows delete own" on follows;
create policy "follows read"       on follows for select to authenticated using (true);
create policy "follows write own"  on follows for insert to authenticated with check (follower = auth.uid());
create policy "follows delete own" on follows for delete to authenticated using (follower = auth.uid());

-- ---------- signup trigger: make a profile automatically ----------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  uname text;
begin
  uname := coalesce(nullif(new.raw_user_meta_data->>'username', ''), 'user_' || left(new.id::text, 8));
  insert into profiles (id, username, display_name)
  values (new.id, uname, uname)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- invite-code functions (security definer) ----------
create or replace function is_invite_valid(code text)
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (select 1 from invite_codes c where c.code = is_invite_valid.code and c.used = false);
$$;

create or replace function consume_invite(code text)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  hit int;
begin
  update invite_codes c
     set used = true, used_by = auth.uid(), used_at = now()
   where c.code = consume_invite.code and c.used = false;
  get diagnostics hit = row_count;
  return hit > 0;
end;
$$;

grant execute on function is_invite_valid(text) to anon, authenticated;
grant execute on function consume_invite(text)  to anon, authenticated;

-- ---------- seed invite codes (change these!) ----------
insert into invite_codes (code) values
  ('COWS-IN-VR'),
  ('DELETE-THE-PICTURES'),
  ('SLOW-FEED-001'),
  ('SLOW-FEED-002'),
  ('SLOW-FEED-003')
on conflict (code) do nothing;
