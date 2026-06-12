"use client";

import { useEffect, useRef, useState } from "react";
import { MODEL_OPTIONS, type ModelOption } from "@/lib/openrouter";

const TIER_LABEL: Record<ModelOption["tier"], string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  free: "Free",
};

export function ModelPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = MODEL_OPTIONS.find((m) => m.id === value) ?? MODEL_OPTIONS[0];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const grouped: Record<string, ModelOption[]> = { anthropic: [], openai: [], free: [] };
  for (const m of MODEL_OPTIONS) grouped[m.tier].push(m);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
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
        {current.label}
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>▾</span>
      </button>
      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: 38,
            left: 0,
            minWidth: 260,
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            padding: 6,
            zIndex: 50,
            maxHeight: 360,
            overflowY: "auto",
          }}
        >
          {(["anthropic", "openai", "free"] as const).map((tier) => (
            <div key={tier} style={{ padding: "4px 0" }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  padding: "6px 10px 4px",
                }}
              >
                {TIER_LABEL[tier]}
              </div>
              {grouped[tier].map((m) => {
                const active = m.id === value;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(m.id);
                      setOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: 6,
                      background: active ? "var(--surface)" : "transparent",
                      color: "var(--text)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{m.label}</div>
                    {m.description && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {m.description}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
