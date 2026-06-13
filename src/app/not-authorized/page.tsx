import Link from "next/link";

export const metadata = {
  title: "Not authorized",
};

export default function NotAuthorizedPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          padding: "32px 28px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            marginBottom: 12,
          }}
        >
          Not authorized
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--text-muted)",
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          chatgptai is currently private. Sign in with an allow-listed account
          to continue.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            height: 40,
            padding: "0 18px",
            background: "var(--btn)",
            color: "var(--btn-fg)",
            border: "none",
            borderRadius: "var(--radius-pill)",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
            lineHeight: "40px",
          }}
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
