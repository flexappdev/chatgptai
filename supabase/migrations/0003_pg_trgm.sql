-- chatgptai · 0003_pg_trgm.sql
-- Enable trigram extension for project memory similarity dedupe.

create extension if not exists "pg_trgm";

create index if not exists project_memories_content_trgm_idx
  on public.project_memories using gin (content gin_trgm_ops);
