# chatgptai backlog

ChatGPT clone — 9 CC sessions, ~28 POMs. See `GOAL.md` for the loop contract and `~/.claude/plans/chatgptai-new-project-steady-dolphin.md` for the full spec.

## Sessions

| # | id              | status   | poms | depends on        | notes |
|---|-----------------|----------|------|-------------------|-------|
| 1 | scaffold-shell  | pending  | 3    | —                 | Next.js 16, theme tokens, Supabase auth, app shell, shadcn |
| 2 | db-schema       | pending  | 2    | CC-01             | 0001_core_schema.sql + RLS + storage bucket + types |
| 3 | chat-core       | pending  | 4    | CC-02             | OpenRouter SSE, model picker, composer, markdown, CRUD |
| 4 | recents-history | pending  | 2    | CC-03             | sidebar buckets, /history FTS, bulk delete |
| 5 | canvas          | pending  | 4    | CC-03             | textdoc parser, split panel, CodeMirror edit, versions |
| 6 | projects        | pending  | 4    | CC-03             | CRUD, instructions, file extract, memory generation |
| 7 | skills          | pending  | 3    | CC-03, CC-06      | SKILL.md ingestion, slash menu, system prompt inject |
| 8 | connectors      | pending  | 3    | CC-03             | web_search (Brave or demo) + mocked Gmail/GDrive/Slack/GH |
| 9 | polish-pass     | pending  | 3    | ALL               | loading/error/empty/palette/keyboard/mobile/a11y |

## Post-merge (after CC-09)

- [ ] `/abc-cleanup chatgptai`
- [ ] `/abc-uxd-audit chatgptai`
- [ ] `/abc-playwright chatgptai run smoke`
- [ ] `/abc-ga sync chatgptai G-<id>`
- [ ] `/abc-vercel chatgptai deploy --prod`
- [ ] Update `README.md` (live URL, env, screenshots)
- [ ] Update `~/APPS/apps-registry.json` with `live_url` + `vercel_project_id`
- [ ] Final `/push` of registry + REPOS.md + README

## Env keys consumed

From `~/context-2026/agents/.env` (synced via `/abc-supabase env sync` + `/abc-vercel env sync`):

- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓
- `OPENROUTER_API_KEY` ✓
- `NEXT_PUBLIC_GA_ID` ✓ (activated post-CC-09)
- `BRAVE_API_KEY` ✗ (absent — web_search runs in demo mode until set)
