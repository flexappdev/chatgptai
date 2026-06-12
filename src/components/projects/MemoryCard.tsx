"use client";

import { useTransition } from "react";
import {
  deleteProjectMemory,
  updateProjectMemoryEnabled,
} from "@/app/(app)/projects/actions";
import type { ProjectMemoryRow } from "@/lib/database.types";

export function MemoryCard({
  projectId,
  enabled,
  memories,
}: {
  projectId: string;
  enabled: boolean;
  memories: ProjectMemoryRow[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <section style={cardStyle}>
      <header style={cardHeader}>
        <span>Memory</span>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) =>
              startTransition(async () => {
                await updateProjectMemoryEnabled(projectId, e.target.checked);
              })
            }
            disabled={pending}
          />
          {enabled ? "On" : "Off"}
        </label>
      </header>
      {memories.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
          Memory is generated automatically as you chat in this project (3
          short notes per turn, deduped via trigram similarity).
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 4 }}>
          {memories.map((m) => (
            <li
              key={m.id}
              style={{
                padding: "6px 8px",
                background: "var(--bg)",
                borderRadius: 6,
                fontSize: 12,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span style={{ flex: 1, lineHeight: 1.5 }}>{m.content}</span>
              <button
                type="button"
                onClick={() => {
                  if (!confirm("Delete this memory?")) return;
                  startTransition(async () => {
                    await deleteProjectMemory(m.id, projectId);
                  });
                }}
                aria-label="Delete memory"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
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
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 10,
};
