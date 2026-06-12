"use client";

import { useEffect, useRef, useState } from "react";
import type { ConnectorDef } from "@/lib/connectors/registry";

export type ConnectedConnector = {
  provider: string;
  label: string;
  icon: string;
};

export function ToolsPopover({
  available,
  enabled,
  onToggle,
}: {
  available: ConnectedConnector[];
  enabled: Set<string>;
  onToggle: (provider: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  if (available.length === 0) return null;

  const activeCount = available.filter((c) => enabled.has(c.provider)).length;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Tools"
        title="Tools"
        style={{
          flexShrink: 0,
          height: 32,
          minWidth: 32,
          padding: "0 8px",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: activeCount > 0 ? "color-mix(in srgb, var(--ok) 22%, transparent)" : "transparent",
          color: "var(--text)",
          border: "1px solid var(--border)",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        ⚙
        {activeCount > 0 && <span>{activeCount}</span>}
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            minWidth: 220,
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            padding: 6,
            zIndex: 60,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "4px 8px 6px",
            }}
          >
            Tools
          </div>
          {available.map((c) => {
            const on = enabled.has(c.provider);
            return (
              <label
                key={c.provider}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onToggle(c.provider)}
                  style={{ accentColor: "var(--ok)" }}
                />
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function defToConnected(d: ConnectorDef): ConnectedConnector {
  return { provider: d.provider, label: d.label, icon: d.icon };
}
