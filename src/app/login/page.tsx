"use client";

import { useState, useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const supabase = supabaseBrowser();
  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:17002";

  const onMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${appUrl}/auth/callback` },
      });
      if (error) setError(error.message);
      else setSent(true);
    });
  };

  const onGoogle = () => {
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${appUrl}/auth/callback` },
      });
      if (error) setError(error.message);
    });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "32px 28px",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          chatgptai
        </h1>

        {sent ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
            Check {email} for the sign-in link.
          </p>
        ) : (
          <>
            <form onSubmit={onMagicLink} style={{ display: "grid", gap: 12 }}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  height: 44,
                  padding: "0 14px",
                  borderRadius: "var(--radius-control)",
                  border: "1px solid var(--border-strong)",
                  background: "transparent",
                  color: "var(--text)",
                  fontSize: 15,
                }}
              />
              <button
                type="submit"
                disabled={pending || !email}
                style={{
                  height: 44,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--btn)",
                  color: "var(--btn-fg)",
                  fontWeight: 500,
                  fontSize: 15,
                  border: "none",
                  cursor: pending ? "wait" : "pointer",
                  opacity: pending || !email ? 0.6 : 1,
                }}
              >
                {pending ? "Sending…" : "Continue with email"}
              </button>
            </form>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "20px 0",
                color: "var(--text-muted)",
                fontSize: 12,
              }}
            >
              <hr style={{ flex: 1, border: 0, borderTop: "1px solid var(--border)" }} />
              OR
              <hr style={{ flex: 1, border: 0, borderTop: "1px solid var(--border)" }} />
            </div>

            <button
              type="button"
              onClick={onGoogle}
              disabled={pending}
              style={{
                width: "100%",
                height: 44,
                borderRadius: "var(--radius-pill)",
                background: "transparent",
                color: "var(--text)",
                fontWeight: 500,
                fontSize: 15,
                border: "1px solid var(--border-strong)",
                cursor: "pointer",
              }}
            >
              Continue with Google
            </button>

            {error && (
              <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 16, textAlign: "center" }}>
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
