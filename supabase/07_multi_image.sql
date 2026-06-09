-- UNSTAGRAM — multi-image posts. Run once in the SQL Editor.
-- A post can describe several photos; each description is one element.
alter table posts add column if not exists prose_parts text[];
