-- chatgptai · 0002_chat_search.sql
-- Full-text search indexes for /history.

create index if not exists chats_title_fts_idx
  on public.chats using gin (to_tsvector('english', coalesce(title, '')));

create index if not exists messages_content_fts_idx
  on public.messages using gin (to_tsvector('english', coalesce(content, '')));
