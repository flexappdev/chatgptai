// End-to-end allowlist proof:
//   1. Generate a magic link for mat@matsiems.com via Supabase admin
//   2. Verify the link to obtain access + refresh tokens
//   3. Set them as the SSR cookie and POST /api/chat on prod
//   4. Assert: middleware allows mat@matsiems.com through and OpenRouter streams
//   5. Print a NEW magic link for the human to click in a browser
//
// Usage: node scripts/test-mat-auth.mjs

import { readFileSync } from "node:fs";

const PROD = "https://chatgptai-three.vercel.app";
const EMAIL = "mat@matsiems.com";

function loadEnv() {
  const env = readFileSync(".env.local", "utf8");
  const out = {};
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

async function jget(res) {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

async function generateMagicLink(supaUrl, svc) {
  const res = await fetch(`${supaUrl}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      apikey: svc,
      Authorization: `Bearer ${svc}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "magiclink",
      email: EMAIL,
      redirect_to: `${PROD}/auth/callback`,
    }),
  });
  if (!res.ok) throw new Error(`generate_link ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.properties?.action_link ?? json.action_link;
}

async function followMagic(link) {
  // GET the magic link with redirects DISABLED, then follow manually so we
  // can capture cookies & the code at the /auth/callback step.
  const u = new URL(link);
  const res = await fetch(u, { redirect: "manual" });
  const loc = res.headers.get("location");
  if (!loc) throw new Error(`No redirect from verify; ${res.status}: ${await res.text().then(t => t.slice(0,200))}`);
  // Supabase returns either ?code=... (PKCE-style) or #access_token=... (fragment).
  // For magic links the modern flow is: redirect_to/auth/callback?code=...
  const cb = new URL(loc);
  const code = cb.searchParams.get("code");
  if (!code) {
    // Fragment style — extract from fragment
    const frag = cb.hash.startsWith("#") ? cb.hash.slice(1) : cb.hash;
    const params = new URLSearchParams(frag);
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    const exp = Number(params.get("expires_at"));
    if (!access || !refresh) throw new Error(`No code and no fragment tokens. loc=${loc}`);
    return { mode: "fragment", access_token: access, refresh_token: refresh, expires_at: exp };
  }
  return { mode: "code", code };
}

async function exchangeCode(supaUrl, anon, code) {
  // Use Supabase's grant_type=pkce equivalent. For admin-generated magiclinks
  // without PKCE flow we use grant_type=authorization_code at /auth/v1/token.
  // gotrue v2 supports `grant_type=authorization_code` for code exchange.
  const res = await fetch(`${supaUrl}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: { apikey: anon, "Content-Type": "application/json" },
    body: JSON.stringify({ auth_code: code, code_verifier: "" }),
  });
  if (res.ok) return res.json();
  // Try the OTP verify endpoint as fallback
  return null;
}

async function main() {
  const env = loadEnv();
  const supaUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const svc = env.SUPABASE_SERVICE_ROLE_KEY;
  const projectRef = new URL(supaUrl).hostname.split(".")[0];

  console.log("=== generate magic link ===");
  const link = await generateMagicLink(supaUrl, svc);
  console.log("link:", link.slice(0, 120) + "…");

  console.log("=== follow link ===");
  const verified = await followMagic(link);
  console.log("mode:", verified.mode);

  let tokens;
  if (verified.mode === "fragment") {
    tokens = verified;
  } else {
    // Magic link → /auth/callback?code=... → we need to POST to /api/auth/exchange
    // Easier: call Supabase's verify endpoint via OTP token-hash style.
    // Pre-extracted token from link works with /auth/v1/verify?token=...&type=magiclink
    const u = new URL(link);
    const token = u.searchParams.get("token");
    const res = await fetch(`${supaUrl}/auth/v1/verify`, {
      method: "POST",
      headers: { apikey: anon, "Content-Type": "application/json" },
      body: JSON.stringify({ type: "magiclink", token }),
    });
    if (!res.ok) throw new Error(`verify ${res.status}: ${await res.text()}`);
    tokens = await res.json();
  }
  console.log("access_token:", tokens.access_token?.slice(0, 28), "…");
  console.log("user:", tokens.user?.email);

  // Build SSR cookie shape and call /api/chat
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

  console.log("=== POST /api/chat ===");
  const res = await fetch(`${PROD}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `${cookieName}=${cookieValue}` },
    body: JSON.stringify({
      chatId: null,
      message: "Reply with exactly: allowlist gate ok",
      model: "anthropic/claude-sonnet-4-6",
    }),
  });
  console.log("response:", res.status);
  if (!res.ok || !res.body) {
    console.log(await jget(res));
    process.exit(1);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let assistant = "";
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
        if (payload.type === "delta") assistant += payload.text;
        if (payload.type === "error") {
          console.log("SSE error:", payload.message);
          process.exit(2);
        }
      } catch {
        /* heartbeat */
      }
    }
  }
  console.log("assistant:", assistant.trim());

  if (!assistant.trim()) {
    console.error("FAIL: empty response");
    process.exit(3);
  }
  console.log("\nPASS: mat@matsiems.com signed in, allowlist accepted, OpenRouter streamed.");

  // Generate one more fresh magic link for the human (since we just consumed one)
  console.log("\n=== fresh magic link for browser use ===");
  const fresh = await generateMagicLink(supaUrl, svc);
  console.log(fresh);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
