"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  deleteChats,
  searchHistory,
  type HistoryResult,
} from "@/app/(app)/history/actions";
import type { ChatRow } from "@/lib/database.types";

export function HistoryList({ initial }: { initial: HistoryResult }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [result, setResult] = useState<HistoryResult>(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    startTransition(async () => {
      const r = await searchHistory(debounced);
      setResult(r);
      setSelected(new Set());
    });
  }, [debounced]);

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onBulkDelete = () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} chat(s)?`)) return;
    startTransition(async () => {
      await deleteChats(Array.from(selected));
      const r = await searchHistory(debounced);
      setResult(r);
      setSelected(new Set());
    });
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          marginBottom: 16,
        }}
      >
        History
      </h1>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats…"
          style={{
            flex: 1,
            height: 40,
            padding: "0 14px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-control)",
            color: "var(--text)",
            fontSize: 14,
            outline: "none",
          }}
        />
        {selected.size > 0 && (
          <button
            type="button"
            onClick={onBulkDelete}
            disabled={pending}
            style={{
              height: 40,
              padding: "0 14px",
              background: "var(--danger)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-control)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Delete {selected.size}
          </button>
        )}
      </div>

      {result.chats.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          {debounced ? "No chats match." : "No chats yet."}
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 4,
          }}
        >
          {result.chats.map((c) => (
            <HistoryRow
              key={c.id}
              chat={c}
              snippet={result.snippets[c.id]}
              query={debounced}
              checked={selected.has(c.id)}
              onToggle={() => toggle(c.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function HistoryRow({
  chat,
  snippet,
  query,
  checked,
  onToggle,
}: {
  chat: ChatRow;
  snippet?: string;
  query: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: 12,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        background: "var(--surface)",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        aria-label={`Select chat ${chat.title}`}
        style={{ marginTop: 4 }}
      />
      <Link
        href={`/chat/${chat.id}`}
        style={{
          flex: 1,
          minWidth: 0,
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {chat.starred && <span>★</span>}
          <span dangerouslySetInnerHTML={{ __html: highlight(chat.title, query) }} />
        </div>
        {snippet && (
          <div
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginTop: 4,
              lineHeight: 1.5,
            }}
            dangerouslySetInnerHTML={{ __html: highlight(snippet, query) }}
          />
        )}
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: 4,
          }}
        >
          {new Date(chat.last_message_at).toLocaleString()}
        </div>
      </Link>
    </li>
  );
}

function highlight(text: string, query: string): string {
  const escaped = escapeHtml(text);
  if (!query) return escaped;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return escaped.replace(
    new RegExp(safe, "gi"),
    (m) =>
      `<mark style="background:color-mix(in srgb, var(--ok) 30%, transparent); color:inherit; padding:0 2px; border-radius:2px;">${m}</mark>`,
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
