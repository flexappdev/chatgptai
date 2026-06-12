"use client";

import { useState, useTransition } from "react";
import { updateProjectInstructions } from "@/app/(app)/projects/actions";

export function InstructionsCard({
  projectId,
  initial,
}: {
  projectId: string;
  initial: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(initial ?? "");
  const [pending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      await updateProjectInstructions(projectId, text);
      setOpen(false);
    });
  };

  return (
    <section style={cardStyle}>
      <header style={cardHeader}>
        <span>Instructions</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={editBtn}
        >
          {open ? "Cancel" : "Edit"}
        </button>
      </header>
      {open ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 8000))}
            rows={10}
            style={{
              width: "100%",
              padding: 12,
              background: "transparent",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontFamily: "inherit",
              fontSize: 13,
              lineHeight: 1.55,
              resize: "vertical",
              outline: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
              fontSize: 11,
              color: "var(--text-muted)",
            }}
          >
            <span>{text.length} / 8000</span>
            <button type="button" onClick={save} disabled={pending} style={primaryBtn}>
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </>
      ) : (
        <p
          style={{
            fontSize: 13,
            color: text ? "var(--text)" : "var(--text-muted)",
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {text || "No instructions yet. Add prose to steer every chat in this project."}
        </p>
      )}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 14,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-card)",
};
const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 10,
};
const editBtn: React.CSSProperties = {
  background: "transparent",
  color: "var(--text-muted)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "2px 8px",
  fontSize: 11,
  cursor: "pointer",
};
const primaryBtn: React.CSSProperties = {
  height: 30,
  padding: "0 14px",
  background: "var(--btn)",
  color: "var(--btn-fg)",
  border: "none",
  borderRadius: "var(--radius-pill)",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
};
