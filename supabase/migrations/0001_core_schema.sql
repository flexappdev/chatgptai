-- chatgptai · 0001_core_schema.sql
-- Core tables, RLS, indexes, triggers, storage bucket.
-- Single-tenant per user: every row carries user_id, RLS scopes to auth.uid().
-- Apply via `/abc-supabase chatgptai migrate 0001_core_schema.sql`.

------------------------------------------------------------------------------
-- Extensions
------------------------------------------------------------------------------

create extension if not exists "pgcrypto";   -- gen_random_uuid()

------------------------------------------------------------------------------
-- updated_at trigger
------------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

------------------------------------------------------------------------------
-- projects
------------------------------------------------------------------------------

create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  description     text,
  instructions    text,
  memory_enabled  boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists projects_user_id_idx
  on public.projects (user_id, updated_at desc);

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
drop policy if exists "projects owner all" on public.projects;
create policy "projects owner all" on public.projects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

------------------------------------------------------------------------------
-- project_files
------------------------------------------------------------------------------

create table if not exists public.project_files (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  filename        text not null,
  storage_path    text not null,
  mime_type       text,
  size_bytes      int,
  extracted_text  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists project_files_project_idx
  on public.project_files (project_id, created_at desc);

drop trigger if exists project_files_updated_at on public.project_files;
create trigger project_files_updated_at before update on public.project_files
  for each row execute function public.set_updated_at();

alter table public.project_files enable row level security;
drop policy if exists "project_files owner all" on public.project_files;
create policy "project_files owner all" on public.project_files
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

------------------------------------------------------------------------------
-- project_memories
------------------------------------------------------------------------------

create table if not exists public.project_memories (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  content         text not null,
  source_chat_id  uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists project_memories_project_idx
  on public.project_memories (project_id, created_at desc);

drop trigger if exists project_memories_updated_at on public.project_memories;
create trigger project_memories_updated_at before update on public.project_memories
  for each row execute function public.set_updated_at();

alter table public.project_memories enable row level security;
drop policy if exists "project_memories owner all" on public.project_memories;
create policy "project_memories owner all" on public.project_memories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

------------------------------------------------------------------------------
-- chats
------------------------------------------------------------------------------

create table if not exists public.chats (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete set null,
  title           text not null default 'New chat',
  model           text not null default 'anthropic/claude-sonnet-4-6',
  starred         boolean not null default false,
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists chats_user_last_msg_idx
  on public.chats (user_id, last_message_at desc);

drop trigger if exists chats_updated_at on public.chats;
create trigger chats_updated_at before update on public.chats
  for each row execute function public.set_updated_at();

alter table public.chats enable row level security;
drop policy if exists "chats owner all" on public.chats;
create policy "chats owner all" on public.chats
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

------------------------------------------------------------------------------
-- messages
------------------------------------------------------------------------------

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  chat_id         uuid not null references public.chats(id) on delete cascade,
  role            text not null check (role in ('user','assistant')),
  content         text not null,
  thinking        text,
  canvas_id       uuid,
  token_count     int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists messages_chat_created_idx
  on public.messages (chat_id, created_at);

drop trigger if exists messages_updated_at on public.messages;
create trigger messages_updated_at before update on public.messages
  for each row execute function public.set_updated_at();

alter table public.messages enable row level security;
drop policy if exists "messages owner all" on public.messages;
create policy "messages owner all" on public.messages
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

------------------------------------------------------------------------------
-- canvases
------------------------------------------------------------------------------

create table if not exists public.canvases (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  chat_id         uuid references public.chats(id) on delete set null,
  identifier      text not null,
  title           text,
  type            text not null check (type in ('document','code','react','html','svg','mermaid')),
  language        text,
  content         text not null,
  version         int not null default 1,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists canvases_chat_idx
  on public.canvases (chat_id, updated_at desc);
create index if not exists canvases_identifier_version_idx
  on public.canvases (user_id, identifier, version desc);

drop trigger if exists canvases_updated_at on public.canvases;
create trigger canvases_updated_at before update on public.canvases
  for each row execute function public.set_updated_at();

alter table public.canvases enable row level security;
drop policy if exists "canvases owner all" on public.canvases;
create policy "canvases owner all" on public.canvases
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

------------------------------------------------------------------------------
-- skills
------------------------------------------------------------------------------

create table if not exists public.skills (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  slug            text not null,
  description     text,
  content         text not null,
  enabled         boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists skills_user_enabled_idx
  on public.skills (user_id, enabled, updated_at desc);

drop trigger if exists skills_updated_at on public.skills;
create trigger skills_updated_at before update on public.skills
  for each row execute function public.set_updated_at();

alter table public.skills enable row level security;
drop policy if exists "skills owner all" on public.skills;
create policy "skills owner all" on public.skills
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

------------------------------------------------------------------------------
-- connectors
------------------------------------------------------------------------------

create table if not exists public.connectors (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  provider        text not null,
  label           text,
  status          text not null default 'disconnected'
                    check (status in ('connected','disconnected','error')),
  config          jsonb not null default '{}'::jsonb,
  enabled         boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists connectors_user_provider_idx
  on public.connectors (user_id, provider);

drop trigger if exists connectors_updated_at on public.connectors;
create trigger connectors_updated_at before update on public.connectors
  for each row execute function public.set_updated_at();

alter table public.connectors enable row level security;
drop policy if exists "connectors owner all" on public.connectors;
create policy "connectors owner all" on public.connectors
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

------------------------------------------------------------------------------
-- Storage bucket: project-files
------------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
  values ('project-files', 'project-files', false)
  on conflict (id) do nothing;

-- Path convention: {user_id}/{project_id}/{filename}
-- First segment of the path must equal the requesting user's auth.uid().

drop policy if exists "project-files owner select" on storage.objects;
create policy "project-files owner select" on storage.objects
  for select using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "project-files owner insert" on storage.objects;
create policy "project-files owner insert" on storage.objects
  for insert with check (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "project-files owner update" on storage.objects;
create policy "project-files owner update" on storage.objects
  for update using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "project-files owner delete" on storage.objects;
create policy "project-files owner delete" on storage.objects
  for delete using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
