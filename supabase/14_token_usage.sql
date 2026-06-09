-- UNSTAGRAM — API token usage analytics. Run once in the SQL Editor.
alter table api_tokens add column if not exists request_count bigint not null default 0;

create or replace function touch_token(p_hash text)
returns void language sql security definer set search_path = public as $$
  update api_tokens set last_used_at = now(), request_count = request_count + 1 where token_hash = p_hash;
$$;
grant execute on function touch_token(text) to anon, authenticated, service_role;
