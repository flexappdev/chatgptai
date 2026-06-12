"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createSkill,
  createSkillFromMarkdown,
} from "@/app/(app)/skills/actions";

type Tab = "upload" | "write";

export function SkillDialog() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("write");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const reset = () => {
    setName("");
    setDescription("");
    setContent("");
    setError(null);
  };

  const onFile = (file: File) => {
    setError(null);
    file.text().then((text) => {
      startTransition(async () => {
        try {
          const slug = await createSkillFromMarkdown(text);
          setOpen(false);
          reset();
          router.push(`/skills/${slug}`);
        } catch (e) {
          setError((e as Error).message);
        }
      });
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const slug = await createSkill({ name, description, content });
        setOpen(false);
        reset();
        router.push(`/skills/${slug}`);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          height: 36,
          padding: "0 16px",
          background: "var(--btn)",
          color: "var(--btn-fg)",
          border: "none",
          borderRadius: "var(--radius-pill)",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        ＋ Add skill
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <h2 style={{ flex: 1, fontSize: 18, fontWeight: 500 }}>Add skill</h2>
              <Tab active={tab === "upload"} label="Upload" onClick={() => setTab("upload")} />
              <Tab active={tab === "write"} label="Write" onClick={() => setTab("write")} />
            </div>
            {tab === "upload" ? (
              <div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    lineHeight: 1.55,
                    marginTop: 0,
                  }}
                >
                  Upload a SKILL.md file with YAML frontmatter (<code>name</code> and{" "}
                  <code>description</code>) followed by markdown instructions.
                </p>
                <input
                  type="file"
                  accept=".md,.markdown,.skill,text/markdown,text/plain"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(f);
                  }}
                  disabled={pending}
                  style={{ marginTop: 12 }}
                />
              </div>
            ) : (
              <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
                <Field label="Name">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                    maxLength={120}
                  />
                </Field>
                <Field label="Description">
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={inputStyle}
                    maxLength={300}
                  />
                </Field>
                <Field label="Instructions (markdown)">
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    style={{
                      ...inputStyle,
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      padding: "10px 14px",
                      resize: "vertical",
                    }}
                  />
                </Field>
                {error && <p style={{ color: "var(--danger)", fontSize: 12 }}>{error}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button type="button" onClick={() => setOpen(false)} style={btnGhost}>
                    Cancel
                  </button>
                  <button type="submit" disabled={pending || !name || !content} style={btnPrimary}>
                    {pending ? "Saving…" : "Create"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function Tab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 28,
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

const inputStyle: React.CSSProperties = {
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
const btnGhost: React.CSSProperties = {
  height: 36,
  padding: "0 14px",
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-pill)",
  fontSize: 13,
  cursor: "pointer",
};
const btnPrimary: React.CSSProperties = {
  height: 36,
  padding: "0 18px",
  background: "var(--btn)",
  color: "var(--btn-fg)",
  border: "none",
  borderRadius: "var(--radius-pill)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};
