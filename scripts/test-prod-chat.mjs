// One-shot prod smoke: create test user → sign in → stream /api/chat → assert
// OpenRouter actually returns deltas through chatgptai.
//
// Usage:
//   node scripts/test-prod-chat.mjs <prod-url>
//
// Reads NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and
// SUPABASE_SERVICE_ROLE_KEY from .env.local.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const PROD_URL = process.argv[2] ?? "https://chatgptai-three.vercel.app";

function loadEnv() {
  const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  const map = {};
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) map[m[1]] = m[2].trim();
  }
  return map;
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const svc = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !svc) throw new Error("Missing Supabase env in .env.local");

  const projectRef = new URL(url).hostname.split(".")[0];
  const email = `chatgptai-smoke+${Date.now()}@example.test`;
  const password = `Smoke!${Date.now()}xyz`;

  console.log(`prod: ${PROD_URL}`);
  console.log(`creating test user ${email}…`);

  // 1) Create + auto-confirm user via admin API
  let res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: svc,
      Authorization: `Bearer ${svc}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  if (!res.ok) throw new Error(`admin/users ${res.status}: ${await res.text()}`);
  const userJson = await res.json();
  const userId = userJson.id;
  console.log(`user id: ${userId}`);

  // 2) Sign in (password grant) to get access_token + refresh_token
  res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anon, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`token grant ${res.status}: ${await res.text()}`);
  const tokens = await res.json();
  console.log(`access_token: ${tokens.access_token.slice(0, 24)}…`);

  // 3) Build the Supabase SSR cookie shape and call /api/chat on prod
  const cookieName = `sb-${projectRef}-auth-token`;
  const cookieValue = encodeURIComponent(
    JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_at,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      user: tokens.user,
    }),
  );

  console.log(`POST ${PROD_URL}/api/chat (streaming)…`);
  res = await fetch(`${PROD_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${cookieName}=${cookieValue}`,
    },
    body: JSON.stringify({
      chatId: null,
      message: "Reply with exactly: prod smoke ok",
      model: "anthropic/claude-sonnet-4-6",
    }),
  });
  console.log(`response: ${res.status} ${res.statusText}`);
  if (!res.ok || !res.body) {
    console.log(await res.text());
    process.exit(1);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let assistant = "";
  let chatId = null;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const events = buf.split("\n\n");
    buf = events.pop() ?? "";
    for (const evt of events) {
      const line = evt.trim();
      if (!line.startsWith("data:")) continue;
      try {
        const payload = JSON.parse(line.slice(5).trim());
        if (payload.type === "chat_created") chatId = payload.chatId;
        if (payload.type === "delta") assistant += payload.text;
        if (payload.type === "done") {
          console.log(`SSE done. chatId=${chatId} messageId=${payload.messageId}`);
        }
        if (payload.type === "error") {
          console.log(`SSE error: ${payload.message}`);
          process.exit(2);
        }
      } catch {
        /* ignore non-JSON heartbeats */
      }
    }
  }
  console.log("---");
  console.log("assistant:", assistant.trim());

  // 4) Clean up: delete test user
  await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: { apikey: svc, Authorization: `Bearer ${svc}` },
  });
  console.log(`cleaned up user ${userId}`);

  if (!assistant.trim()) {
    console.error("\nFAIL: empty assistant response");
    process.exit(3);
  }
  console.log("\nPASS: OpenRouter round-trip through chatgptai prod is green.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
