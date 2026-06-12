"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 500 }}>Something went wrong.</div>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-muted)",
          maxWidth: 480,
          lineHeight: 1.55,
        }}
      >
        {error.message || "Unknown error."}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          height: 36,
          padding: "0 18px",
          background: "var(--btn)",
          color: "var(--btn-fg)",
          border: "none",
          borderRadius: "var(--radius-pill)",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
