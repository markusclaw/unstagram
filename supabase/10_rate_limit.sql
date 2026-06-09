-- UNSTAGRAM — API rate limiting. Run once in the SQL Editor.
create table if not exists api_rate (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        int not null default 0
);
alter table api_rate enable row level security; -- locked; only the RPC (security definer) touches it

-- Atomic fixed-window bump. Returns true if the request is allowed.
create or replace function bump_rate(p_key text, p_limit int, p_window int)
returns boolean language plpgsql security definer set search_path = public as $$
declare new_count int; now_ts timestamptz := now();
begin
  insert into api_rate (key, window_start, count) values (p_key, now_ts, 1)
  on conflict (key) do update set
    window_start = case when api_rate.window_start < now_ts - make_interval(secs => p_window) then now_ts else api_rate.window_start end,
    count = case when api_rate.window_start < now_ts - make_interval(secs => p_window) then 1 else api_rate.count + 1 end
  returning count into new_count;
  return new_count <= p_limit;
end; $$;

grant execute on function bump_rate(text, int, int) to anon, authenticated, service_role;
