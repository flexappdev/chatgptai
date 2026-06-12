"use client";

import { useState } from "react";

export function ToolCallRow({
  name,
  args,
  result,
}: {
  name: string;
  args?: string;
  result?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        margin: "10px 0",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        fontSize: 12,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          width: "100%",
          textAlign: "left",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "transparent",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        <span>🔧 Used {name}</span>
        <span style={{ marginLeft: "auto", fontSize: 10 }}>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 12px 10px" }}>
          {args && (
            <pre style={preStyle}>
              <code>{args}</code>
            </pre>
          )}
          {result && (
            <pre style={{ ...preStyle, marginTop: 4 }}>
              <code>{result}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

const preStyle: React.CSSProperties = {
  margin: 0,
  padding: 10,
  background: "var(--code-bg)",
  borderRadius: 6,
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  lineHeight: 1.5,
  color: "var(--text)",
  maxHeight: 240,
  overflow: "auto",
  whiteSpace: "pre-wrap",
};
