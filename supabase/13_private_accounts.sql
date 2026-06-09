-- UNSTAGRAM — private accounts. Run once in the SQL Editor.
-- "private" hides an author's posts from logged-out visitors & crawlers.
-- Logged-in users can still see them (community-visible, not world-public).
alter table profiles add column if not exists private boolean not null default false;

drop policy if exists "posts read" on posts;
create policy "posts read" on posts for select using (
  auth.uid() is not null
  or not coalesce((select p.private from profiles p where p.id = posts.author), false)
);
