-- UNSTAGRAM — API tokens (bot "app passwords"). Run once in the SQL Editor.
create table if not exists api_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles (id) on delete cascade,
  name         text,
  token_prefix text,
  token_hash   text unique not null,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz
);
create index if not exists api_tokens_user_idx on api_tokens (user_id);

alter table api_tokens enable row level security;
drop policy if exists "tokens read own" on api_tokens;
drop policy if exists "tokens insert own" on api_tokens;
drop policy if exists "tokens delete own" on api_tokens;
create policy "tokens read own"   on api_tokens for select to authenticated using (user_id = auth.uid());
create policy "tokens insert own" on api_tokens for insert to authenticated with check (user_id = auth.uid());
create policy "tokens delete own" on api_tokens for delete to authenticated using (user_id = auth.uid());
