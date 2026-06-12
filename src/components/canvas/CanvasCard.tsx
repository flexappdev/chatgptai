"use client";

import { useCanvasPanel } from "@/stores/canvasPanel";
import type { CanvasType } from "@/lib/canvas/parser";

const TYPE_ICON: Record<CanvasType, string> = {
  document: "📝",
  code: "💻",
  react: "⚛︎",
  html: "🌐",
  svg: "🎨",
  mermaid: "📊",
};

export function CanvasCard({
  identifier,
  title,
  type,
  language,
  content,
  streaming,
  canvasId,
  version,
}: {
  identifier: string;
  title?: string;
  type: CanvasType;
  language?: string;
  content: string;
  streaming?: boolean;
  canvasId?: string;
  version?: number;
}) {
  const openCanvas = useCanvasPanel((s) => s.openCanvas);

  const label = title || identifier;

  return (
    <button
      type="button"
      onClick={() =>
        openCanvas({
          id: canvasId,
          identifier,
          title,
          type,
          language,
          content,
          version: version ?? 1,
          streaming,
        })
      }
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        maxWidth: 480,
        padding: 14,
        margin: "12px 0",
        background: "var(--surface)",
        border: streaming ? "1px solid var(--ok)" : "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        cursor: "pointer",
        textAlign: "left",
        color: "var(--text)",
        animation: streaming ? "chatgptai-card-pulse 1.6s ease-in-out infinite" : "none",
      }}
    >
      <span style={{ fontSize: 22 }}>{TYPE_ICON[type]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          {type}
          {language ? ` · ${language}` : ""}
          {streaming ? " · drafting…" : " · Click to open"}
        </div>
      </div>
      <style>{`
        @keyframes chatgptai-card-pulse {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--ok) 40%, transparent); }
          50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--ok) 18%, transparent); }
        }
      `}</style>
    </button>
  );
}
