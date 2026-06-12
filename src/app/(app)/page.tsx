export default function HomePage() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: "var(--text)",
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        What can I help with?
      </h1>

      <div
        aria-label="Composer (wired in CC-03)"
        style={{
          width: "100%",
          maxWidth: 720,
          minHeight: 56,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-pill)",
          padding: "14px 20px",
          color: "var(--text-muted)",
          fontSize: 15,
          display: "flex",
          alignItems: "center",
        }}
      >
        Message chatgptai…
      </div>

      <p
        style={{
          marginTop: 24,
          fontSize: 12,
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        chatgptai can make mistakes. Verify important info.
      </p>
    </div>
  );
}
