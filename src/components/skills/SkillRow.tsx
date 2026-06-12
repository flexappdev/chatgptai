"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteSkill, updateSkill } from "@/app/(app)/skills/actions";
import type { SkillRow as SkillRowType } from "@/lib/database.types";

export function SkillRow({ skill }: { skill: SkillRowType }) {
  const [pending, startTransition] = useTransition();
  return (
    <tr style={{ borderTop: "1px solid var(--border)" }}>
      <td style={cell}>
        <Link href={`/skills/${skill.slug}`} style={{ color: "var(--text)", textDecoration: "none", fontWeight: 500 }}>
          {skill.name}
        </Link>
      </td>
      <td style={{ ...cell, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
        /{skill.slug}
      </td>
      <td style={{ ...cell, fontSize: 12, color: "var(--text-muted)", maxWidth: 360 }}>
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {skill.description}
        </div>
      </td>
      <td style={cell}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <input
            type="checkbox"
            checked={skill.enabled}
            onChange={(e) =>
              startTransition(async () => {
                await updateSkill(skill.slug, { enabled: e.target.checked });
              })
            }
            disabled={pending}
          />
          {skill.enabled ? "On" : "Off"}
        </label>
      </td>
      <td style={cell}>
        <button
          type="button"
          onClick={() => {
            if (!confirm(`Delete skill "${skill.name}"?`)) return;
            startTransition(async () => {
              await deleteSkill(skill.slug);
            });
          }}
          style={{
            background: "transparent",
            color: "var(--danger)",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

const cell: React.CSSProperties = {
  padding: "10px 12px",
  fontSize: 13,
  verticalAlign: "middle",
};
