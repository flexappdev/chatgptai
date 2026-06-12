"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/app/(app)/projects/actions";

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const id = await createProject({ name, description });
        setOpen(false);
        setName("");
        setDescription("");
        router.push(`/projects/${id}`);
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
        ＋ New project
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
          <form
            onSubmit={submit}
            style={{
              width: "100%",
              maxWidth: 460,
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginBottom: 16,
              }}
            >
              New project
            </h2>
            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
              Name
            </label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              maxLength={200}
            />
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 12,
                marginBottom: 4,
              }}
            >
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              style={{ ...inputStyle, resize: "vertical", padding: "10px 14px" }}
            />
            {error && (
              <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 8 }}>{error}</p>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 20,
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                style={btnGhost}
              >
                Cancel
              </button>
              <button type="submit" disabled={pending || !name.trim()} style={btnPrimary}>
                {pending ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
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
