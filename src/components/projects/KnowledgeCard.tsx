"use client";

import { useState, useTransition, useRef } from "react";
import { uploadProjectFile, deleteProjectFile } from "@/app/(app)/projects/actions";
import type { ProjectFileRow } from "@/lib/database.types";

export function KnowledgeCard({
  projectId,
  files,
}: {
  projectId: string;
  files: ProjectFileRow[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = (file: File) => {
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const r = await uploadProjectFile(projectId, formData);
      if (!r.ok) setError(r.error ?? "Upload failed");
    });
  };

  return (
    <section style={cardStyle}>
      <header style={cardHeader}>
        <span>Knowledge ({files.length}/20)</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={files.length >= 20 || pending}
          style={editBtn}
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".txt,.md,.markdown,.csv,.tsv,.json,.xml,.yaml,.yml,.log,.pdf,.docx"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
      </header>
      {error && <p style={{ color: "var(--danger)", fontSize: 12 }}>{error}</p>}
      {files.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
          Drop in txt / md / csv / json files. PDF and DOCX upload but won&apos;t be
          extracted yet.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 4 }}>
          {files.map((f) => (
            <li
              key={f.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: 6,
                background: "var(--bg)",
                fontSize: 12,
              }}
            >
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.filename}
              </span>
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: 11,
                  background: f.extracted_text ? "color-mix(in srgb, var(--ok) 18%, transparent)" : "transparent",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                {f.extracted_text ? "ready" : "no extract"}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!confirm(`Delete ${f.filename}?`)) return;
                  startTransition(async () => {
                    await deleteProjectFile(f.id, projectId);
                  });
                }}
                aria-label="Delete file"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: 13,
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
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
  gap: 8,
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
