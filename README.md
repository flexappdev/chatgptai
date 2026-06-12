# chatgptai

A faithful ChatGPT product surface — chats with streaming, projects with memory, canvas with split-screen edit/preview, skills, and connectors. Part of Mat Siems' flexappdev fleet.

- **Prod:** https://chatgptai-three.vercel.app
- **Repo:** https://github.com/flexappdev/chatgptai
- **Local:** `~/APPS/chatgptai` · port **17002**
- **Stack:** Next.js 16.2.9 · React 19 · TypeScript strict · Tailwind v4 (layout only) · shadcn/ui-ready · Supabase (Postgres + Auth + Storage + RLS) · OpenRouter
- **Vercel project:** `prj_zEUzrJwH5UqPm0GZOamns53Zl5Gk` (matsiems team)

## Features (v1)

| Surface | What ships |
|---|---|
| **Chat** | OpenRouter SSE streaming, tiered model picker (Anthropic / OpenAI / Free), per-chat model persistence, auto title generation, rename / star / move / delete, breathing-dot cursor while streaming, markdown + GFM with copy-on-code-block |
| **Recents + History** | Sidebar bucketed by date (Today / Yesterday / 7d / 30d / Older), full-text history search with highlighted snippets, bulk delete |
| **Canvas** | `<textdoc>` stream parser tolerating chunk-split tags, split-screen panel (Edit / Preview), CodeMirror-style editor with debounced versioning, iframe-sandboxed React + HTML + SVG + Mermaid previews, /canvas library of latest versions |
| **Projects** | CRUD, scoped composer, instructions (8k char cap), knowledge files (txt/md/csv/json upload with inline extraction), memory toggle + manual delete |
| **Skills** | Registry table, SKILL.md upload (`gray-matter` frontmatter), write-inline, slash menu in the composer (`/your-skill` chip), system-prompt injection at request time |
| **Connectors** | 5-connector registry, Brave Web Search executor (demo mode when `BRAVE_API_KEY` is absent), Gmail/Drive/Slack/GitHub stubs, single-iteration tool-call round-trip in the chat route, ToolsPopover in composer, collapsible 🔧 tool-call disclosures |
| **Polish** | Per-route loading skeletons, error boundary, ⌘K command palette, ⌘⇧O new chat, per-route titles, prefers-reduced-motion, theme cookie pre-paint |

## Build map

```
CC-01 scaffold-shell  → PR #1
CC-02 db-schema       → PR #2
CC-03 chat-core       → PR #3   (spine)
CC-04 recents-history → PR #4
CC-05 canvas          → PR #5
CC-06 projects        → PR #6
CC-07 skills          → PR #7
CC-08 connectors      → PR #8
CC-09 polish-pass     → PR #9
```

Full spec lives at `~/.claude/plans/chatgptai-new-project-steady-dolphin.md`. Loop contract is in `GOAL.md`, PBI mirror in `BACKLOG.md`.

## Dev

```bash
cd ~/APPS/chatgptai
npm install
cp .env.example .env.local   # then populate from ~/context-2026/agents/.env
npm run dev                  # http://localhost:17002
```

To sync env from the fleet's central store:

```bash
grep -E "^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY|OPENROUTER_API_KEY)=" \
  ~/context-2026/agents/.env > .env.local
echo "APP_URL=http://localhost:17002" >> .env.local
```

## Database

Three migrations under `supabase/migrations/`:

- `0001_core_schema.sql` — 8 tables + RLS + `project-files` storage bucket
- `0002_chat_search.sql` — GIN FTS indexes on chat title + message content
- `0003_pg_trgm.sql` — trigram index for project memory dedupe

Apply with `/abc-supabase chatgptai migrate <file>`.

## Env

| key | required | source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | central env |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | central env |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | central env (used by future server routes) |
| `OPENROUTER_API_KEY` | yes | central env — drives the chat layer |
| `APP_URL` | recommended | OpenRouter `HTTP-Referer` header |
| `NEXT_PUBLIC_GA_ID` | optional | activate via `/abc-ga sync chatgptai G-XXXX` |
| `BRAVE_API_KEY` | optional | enables real Web Search (otherwise demo mode) |

## Deployment state

- [x] 3 Supabase migrations applied to `tciqizkiseraumwdzxya` via Management API (8 tables, RLS, storage bucket, GIN FTS, pg_trgm) — 2026-06-12
- [x] Vercel project linked to matsiems team, 5 prod env vars synced, first deploy LIVE — 2026-06-12
- [x] Prod OpenRouter round-trip verified end-to-end via `scripts/test-prod-chat.mjs` (create user → sign in → SSE stream `/api/chat` → assert reply → clean up). Default model `anthropic/claude-sonnet-4-6`. Cost per smoke ≈ $0.0002.
- [ ] Enable Google OAuth provider in Supabase dashboard (manual)
- [ ] `/abc-ga sync chatgptai G-XXXX` once a GA4 measurement id is allocated
- [ ] Optional: `BRAVE_API_KEY` in Vercel env to flip web_search from demo → live

### Smoke test

```bash
node scripts/test-prod-chat.mjs https://chatgptai-three.vercel.app
```

Should print `PASS: OpenRouter round-trip through chatgptai prod is green.`

## Open follow-ups

- PDF + DOCX text extraction in `/api/projects/extract` (unpdf + mammoth)
- Multi-round tool-call loop (current loop caps at 1 iteration)
- shiki syntax highlighting in `Markdown.tsx` code blocks
- Mobile sidebar slide-over below 768px
- Memory generation after chat completion (table is in place; cron / fire-and-forget hook is the missing piece)
