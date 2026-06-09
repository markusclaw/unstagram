-- UNSTAGRAM — purge expired stories hourly.
-- First enable pg_cron: Supabase Dashboard → Database → Extensions → enable "pg_cron".
-- Then run this once:
select cron.schedule(
  'purge-expired-stories',
  '0 * * * *',
  $$ delete from stories where expires_at < now(); $$
);
-- (One-time manual cleanup, optional:)
-- delete from stories where expires_at < now();
