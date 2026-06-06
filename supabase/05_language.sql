-- UNSTAGRAM — preferred language per user. Run once in the SQL Editor.
alter table profiles add column if not exists language text not null default 'en';

-- include language when auto-creating the profile at signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  uname text;
  ulang text;
begin
  uname := coalesce(nullif(new.raw_user_meta_data->>'username', ''), 'user_' || left(new.id::text, 8));
  ulang := coalesce(nullif(new.raw_user_meta_data->>'language', ''), 'en');
  insert into profiles (id, username, display_name, language)
  values (new.id, uname, uname, ulang)
  on conflict (id) do nothing;
  return new;
end;
$$;
