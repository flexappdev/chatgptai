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
        justifyContent: "flex-end",
        padding: "0 16px",
        gap: 12,
      }}
    >
      {/* Model picker lives inside ChatView so it can drive its own state.
          TopBar holds chrome that's chat-agnostic. */}
      <ThemeToggle />
    </header>
  );
}
