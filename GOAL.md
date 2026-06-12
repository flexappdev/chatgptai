# chatgptai goal — ChatGPT clone, 9 CC sessions

**Plan source:** `/home/matsiems/.claude/plans/chatgptai-new-project-steady-dolphin.md`
**Repo:** `~/APPS/chatgptai` → https://github.com/flexappdev/chatgptai
**Port:** 17002
**Stack:** Next.js 16 + React 19 + TS strict + Tailwind v4 + shadcn/ui + Supabase + OpenRouter
**Branch strategy:** one feature branch per session, PR → squash-merge to main. Never push to main.
**Loop pacing:** /loop self-paced. Spine sequential (CC-01 → CC-02 → CC-03). Then CC-04/05/06/08 may fan out. CC-07 needs CC-06. CC-09 last.

---

## Sessions

| # | id            | deps              | branch                     | status | merge SHA |
|---|---------------|-------------------|----------------------------|--------|-----------|
| 1 | scaffold-shell | —                | feature/scaffold-shell     | [ ]    |           |
| 2 | db-schema      | CC-01            | feature/db-schema          | [ ]    |           |
| 3 | chat-core      | CC-02            | feature/chat-core          | [ ]    |           |
| 4 | recents-history | CC-03           | feature/recents-history    | [ ]    |           |
| 5 | canvas         | CC-03            | feature/canvas             | [ ]    |           |
| 6 | projects       | CC-03            | feature/projects           | [ ]    |           |
| 7 | skills         | CC-03, CC-06     | feature/skills             | [ ]    |           |
| 8 | connectors     | CC-03            | feature/connectors         | [ ]    |           |
| 9 | polish-pass    | ALL              | feature/polish-pass        | [ ]    |           |

After CC-09 merges: `/abc-cleanup` → `/abc-uxd-audit` → `/abc-playwright run smoke` → `/abc-ga sync` → `/abc-vercel deploy --prod` → README → registry `live_url` → final `/push`.

---

## Loop contract

Each iteration:
1. Read this file. Find first unchecked row whose deps are all `[x]`.
2. `git checkout main && git pull && git checkout -b feature/<slug>`.
3. Implement per the matching CC-XX spec block in the plan file.
4. `npm run build && npx tsc --noEmit` — must be green. If red, stop and write the error under `## Blocked` below, leave row unchecked.
5. `gh pr create --title "feat(cc-XX): <slug>"` (or commit + push if branch protection allows direct merge).
6. Squash-merge to main, capture SHA.
7. Tick the row in the table above, fill merge SHA, save this file.
8. `ScheduleWakeup(60s if success, 1200s if blocked)` with the same /loop prompt.

---

## OpenRouter substitutions (locked)

- Default model: `anthropic/claude-sonnet-4-6` (paid, index 0 — never let a free model occupy index 0; see `CLAUDE.md` AIOS gotcha).
- Picker tiers: Anthropic / OpenAI / Free.
- Web search: function-calling tool wrapping Brave Search API. If `BRAVE_API_KEY` absent (currently absent in central env), executor returns `{demo: true}` like other mocked connectors. Surface this in the connectors UI as a `Setup needed` badge.

---

## Pre-flight checklist

- [x] Directory created: `~/APPS/chatgptai/`
- [x] git init -b main
- [x] Registered in `~/APPS/apps-registry.json` (rank 29, port 17002, accent #10A37F)
- [x] Added to `~/APPS/REPOS.md`
- [x] GOAL.md (this file)
- [ ] BACKLOG.md (fleet PBI mirror)
- [ ] GitHub repo `flexappdev/chatgptai` created
- [ ] Initial commit pushed

---

## Blocked

_(empty)_
