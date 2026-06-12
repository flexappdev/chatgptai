# chatgptai

ChatGPT clone — chats with streaming, projects with memory, canvas with split-screen edit/preview, skills, and connectors. Part of Mat Siems' flexappdev fleet.

- **Repo:** https://github.com/flexappdev/chatgptai
- **Local:** `~/APPS/chatgptai` · port **17002**
- **Stack:** Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4 · shadcn/ui · Supabase · OpenRouter

## Build

9-session CC pack. See `GOAL.md` for the loop contract and `BACKLOG.md` for the PBI table. Full spec in `~/.claude/plans/chatgptai-new-project-steady-dolphin.md`.

```
CC-01 scaffold-shell ──► CC-02 db-schema ──► CC-03 chat-core ──► CC-04 recents-history
                                                              ├─► CC-05 canvas
                                                              ├─► CC-06 projects ──► CC-07 skills
                                                              └─► CC-08 connectors
                                                                       └─► CC-09 polish-pass
```

## Dev

```bash
npm install
cp .env.example .env.local   # populate from ~/context-2026/agents/.env
npm run dev                  # http://localhost:17002
```

## Env

| key | required | source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | central env |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | central env |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | central env |
| `OPENROUTER_API_KEY` | yes | central env |
| `NEXT_PUBLIC_GA_ID` | no | activated post-launch via `/abc-ga sync` |
| `BRAVE_API_KEY` | no | `web_search` connector runs demo mode if absent |
