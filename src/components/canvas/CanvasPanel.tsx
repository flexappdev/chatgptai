"use client";

import { useEffect, useState } from "react";
import { useCanvasPanel } from "@/stores/canvasPanel";
import { Markdown } from "@/components/chat/Markdown";
import { HtmlPreview } from "./previews/HtmlPreview";
import { ReactPreview } from "./previews/ReactPreview";
import { MermaidPreview } from "./previews/MermaidPreview";
import { saveCanvasEdit } from "@/app/(app)/canvas/actions";

export function CanvasPanel() {
  const open = useCanvasPanel((s) => s.open);
  const current = useCanvasPanel((s) => s.current);
  const close = useCanvasPanel((s) => s.close);
  const setContent = useCanvasPanel((s) => s.setContent);

  const [tab, setTab] = useState<"edit" | "preview">("preview");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (current?.type === "code") setTab("edit");
  }, [current?.identifier, current?.type]);

  // Debounced edit save
  useEffect(() => {
    if (!current || !current.id) return;
    if (current.streaming) return;
    setSaveStatus("saving");
    const t = setTimeout(async () => {
      try {
        await saveCanvasEdit({
          identifier: current.identifier,
          type: current.type,
          title: current.title,
          language: current.language,
          content: current.content,
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.content]);

  if (!open || !current) return null;

  return (
    <aside
      role="dialog"
      aria-label="Canvas"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: "min(820px, 55vw)",
        background: "var(--surface-raised)",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        boxShadow: "-8px 0 24px rgba(0,0,0,0.18)",
      }}
    >
      <header
        style={{
          height: 56,
          borderBottom: "1px solid var(--border)",
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {current.title || current.identifier}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {current.type}
            {current.language ? ` · ${current.language}` : ""}
            {" · v"}
            {current.version}
            {current.id && !current.streaming && (
              <>
                {" · "}
                <span style={{ color: saveStatus === "saved" ? "var(--ok)" : "var(--text-muted)" }}>
                  {saveStatus === "saving" && "saving…"}
                  {saveStatus === "saved" && "saved"}
                  {saveStatus === "error" && "save failed"}
                  {saveStatus === "idle" && ""}
                </span>
              </>
            )}
          </div>
        </div>
        <Tab active={tab === "edit"} label="Edit" onClick={() => setTab("edit")} />
        {current.type !== "code" && (
          <Tab active={tab === "preview"} label="Preview" onClick={() => setTab("preview")} />
        )}
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(current.content)}
          style={iconBtn}
          aria-label="Copy"
        >
          ⎘
        </button>
        <button
          type="button"
          onClick={close}
          style={iconBtn}
          aria-label="Close"
        >
          ✕
        </button>
      </header>

      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {tab === "edit" ? (
          <textarea
            value={current.content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              padding: "14px 18px",
              background: "var(--code-bg)",
              color: "var(--text)",
              border: "none",
              outline: "none",
              resize: "none",
              fontFamily: current.type === "code" ? "var(--font-mono)" : "var(--font-sans)",
              fontSize: 13,
              lineHeight: 1.55,
            }}
          />
        ) : (
          <div style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
            {current.type === "document" && (
              <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
                <Markdown content={current.content} />
              </div>
            )}
            {current.type === "html" && <HtmlPreview html={current.content} />}
            {current.type === "svg" && <HtmlPreview html={current.content} />}
            {current.type === "react" && <ReactPreview code={current.content} />}
            {current.type === "mermaid" && <MermaidPreview code={current.content} />}
          </div>
        )}
      </div>
    </aside>
  );
}

const iconBtn: React.CSSProperties = {
  height: 32,
  width: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: 6,
  cursor: "pointer",
  color: "var(--text-muted)",
};

function Tab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 32,
        padding: "0 12px",
        background: active ? "var(--surface)" : "transparent",
        color: active ? "var(--text)" : "var(--text-muted)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
