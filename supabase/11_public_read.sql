-- UNSTAGRAM — public read for SEO/GEO. Run once in the SQL Editor.
-- Open SELECT to everyone (anon + authenticated) for the public-facing content.
-- Writes stay locked to the owning user (unchanged).

drop policy if exists "posts read" on posts;
create policy "posts read" on posts for select using (true);

drop policy if exists "comments read" on comments;
create policy "comments read" on comments for select using (true);

drop policy if exists "likes read" on likes;
create policy "likes read" on likes for select using (true);

drop policy if exists "reposts read" on reposts;
create policy "reposts read" on reposts for select using (true);

drop policy if exists "follows read" on follows;
create policy "follows read" on follows for select using (true);

drop policy if exists "comment_likes read" on comment_likes;
create policy "comment_likes read" on comment_likes for select using (true);

-- profiles were already public-read.
