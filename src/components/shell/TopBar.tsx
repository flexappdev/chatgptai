"use client";

import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  return (
    <header
      style={{
        height: 56,
        flexShrink: 0,
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          aria-label="Model picker"
          style={{
            height: 32,
            padding: "0 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-control)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          claude-sonnet-4-6
          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>▾</span>
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ThemeToggle />
      </div>
    </header>
  );
}
