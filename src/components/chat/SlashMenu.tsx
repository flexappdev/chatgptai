"use client";

import { useEffect, useState } from "react";
import type { SkillRow } from "@/lib/database.types";

export function SlashMenu({
  filter,
  onPick,
  onClose,
}: {
  filter: string;
  onPick: (skill: SkillRow) => void;
  onClose: () => void;
}) {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch("/api/skills/list")
      .then((r) => r.json())
      .then((j) => setSkills(j.skills ?? []))
      .catch(() => setSkills([]));
  }, []);

  const filtered = skills.filter((s) =>
    !filter ? true : s.slug.includes(filter) || s.name.toLowerCase().includes(filter.toLowerCase()),
  );

  useEffect(() => {
    setActive(0);
  }, [filter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (filtered.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => (a + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => (a - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        onPick(filtered[active]!);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [filtered, active, onPick, onClose]);

  if (filtered.length === 0) return null;

  return (
    <div
      role="listbox"
      style={{
        position: "absolute",
        bottom: 60,
        left: 0,
        right: 0,
        maxWidth: 360,
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        padding: 4,
        zIndex: 50,
        maxHeight: 240,
        overflowY: "auto",
      }}
    >
      {filtered.map((s, i) => (
        <button
          key={s.id}
          type="button"
          role="option"
          aria-selected={i === active}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(s);
          }}
          onMouseEnter={() => setActive(i)}
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            padding: "8px 10px",
            background: i === active ? "var(--surface)" : "transparent",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            color: "var(--text)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, fontFamily: "var(--font-mono)" }}>
            /{s.slug}
          </div>
          {s.description && (
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.description}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
