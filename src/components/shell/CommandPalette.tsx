"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Cmd = {
  id: string;
  label: string;
  shortcut?: string;
  run: () => void;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Cmd[] = [
    { id: "new", label: "New chat", shortcut: "⌘⇧O", run: () => router.push("/") },
    { id: "history", label: "History", run: () => router.push("/history") },
    { id: "projects", label: "Projects", run: () => router.push("/projects") },
    { id: "canvas", label: "Canvas library", run: () => router.push("/canvas") },
    { id: "skills", label: "Skills", run: () => router.push("/skills") },
    { id: "connectors", label: "Connectors", run: () => router.push("/connectors") },
  ];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (meta && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        router.push("/");
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, router]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  if (!open) return null;

  const filtered = commands.filter((c) =>
    !query ? true : c.label.toLowerCase().includes(query.toLowerCase()),
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
      setOpen(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "10vh 16px",
        zIndex: 250,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Type a command…"
          style={{
            width: "100%",
            height: 48,
            padding: "0 18px",
            background: "transparent",
            color: "var(--text)",
            border: "none",
            borderBottom: "1px solid var(--border)",
            fontSize: 15,
            outline: "none",
          }}
        />
        <div style={{ padding: 6 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 14, color: "var(--text-muted)", fontSize: 13 }}>
              No matches.
            </div>
          ) : (
            filtered.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  c.run();
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  width: "100%",
                  textAlign: "left",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: i === active ? "var(--surface)" : "transparent",
                  color: "var(--text)",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                <span>{c.label}</span>
                {c.shortcut && (
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {c.shortcut}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
