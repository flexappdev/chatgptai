"use client";

import { useState, useTransition } from "react";
import { Markdown } from "@/components/chat/Markdown";
import { updateSkill } from "@/app/(app)/skills/actions";
import type { SkillRow } from "@/lib/database.types";

export function SkillEditor({ skill }: { skill: SkillRow }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(skill.content);
  const [name, setName] = useState(skill.name);
  const [description, setDescription] = useState(skill.description ?? "");
  const [pending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      await updateSkill(skill.slug, { name, description, content });
      setEditing(false);
    });
  };

  if (!editing) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button type="button" onClick={() => setEditing(true)} style={ghostBtn}>
            Edit
          </button>
        </div>
        <Markdown content={content} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <label style={{ display: "block" }}>
        <span style={lbl}>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} style={input} maxLength={120} />
      </label>
      <label style={{ display: "block" }}>
        <span style={lbl}>Description</span>
        <input value={description} onChange={(e) => setDescription(e.target.value)} style={input} maxLength={300} />
      </label>
      <label style={{ display: "block" }}>
        <span style={lbl}>Instructions</span>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          style={{
            ...input,
            height: "auto",
            padding: "12px 14px",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            resize: "vertical",
          }}
        />
      </label>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button type="button" onClick={() => setEditing(false)} style={ghostBtn}>
          Cancel
        </button>
        <button type="button" onClick={save} disabled={pending} style={primaryBtn}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "var(--text-muted)",
  marginBottom: 4,
};
const input: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 14px",
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-control)",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
};
const ghostBtn: React.CSSProperties = {
  height: 32,
  padding: "0 12px",
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-pill)",
  fontSize: 12,
  cursor: "pointer",
};
const primaryBtn: React.CSSProperties = {
  height: 32,
  padding: "0 14px",
  background: "var(--btn)",
  color: "var(--btn-fg)",
  border: "none",
  borderRadius: "var(--radius-pill)",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
};
