"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import type { ChatRow } from "@/lib/database.types";
import { groupByBucket } from "@/lib/date-buckets";
import { deleteChat, renameChat, starChat } from "@/app/(app)/chat/actions";

export function RecentsList({ chats }: { chats: ChatRow[] }) {
  const pathname = usePathname();
  const groups = groupByBucket(chats);

  if (chats.length === 0) {
    return (
      <div
        style={{
          fontSize: 13,
          color: "var(--text-muted)",
          padding: "4px 8px",
          lineHeight: 1.5,
        }}
      >
        No chats yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {groups.map(({ label, chats }) => (
        <div key={label}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "4px 8px",
            }}
          >
            {label}
          </div>
          <div style={{ display: "grid", gap: 2 }}>
            {chats.map((c) => (
              <ChatRowItem
                key={c.id}
                chat={c}
                active={pathname === `/chat/${c.id}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatRowItem({ chat, active }: { chat: ChatRow; active: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(chat.title);
  const [pending, startTransition] = useTransition();

  const commitRename = () => {
    startTransition(async () => {
      await renameChat(chat.id, title);
      setRenaming(false);
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 32,
          padding: "0 8px",
          borderRadius: "var(--radius-control)",
          background: active ? "var(--surface)" : "transparent",
          color: active ? "var(--text)" : "var(--text-muted)",
          fontSize: 13,
        }}
      >
        {renaming ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setTitle(chat.title);
                setRenaming(false);
              }
            }}
            disabled={pending}
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "1px solid var(--border-strong)",
              borderRadius: 4,
              color: "var(--text)",
              padding: "2px 6px",
              fontSize: 13,
              outline: "none",
            }}
          />
        ) : (
          <Link
            href={`/chat/${chat.id}`}
            style={{
              flex: 1,
              minWidth: 0,
              color: "inherit",
              textDecoration: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {chat.starred && <span style={{ marginRight: 4 }}>★</span>}
            {chat.title}
          </Link>
        )}
        <button
          type="button"
          aria-label="Chat actions"
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen((o) => !o);
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "0 4px",
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          ⋯
        </button>
      </div>
      {menuOpen && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: 32,
            right: 4,
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            padding: 4,
            zIndex: 50,
            minWidth: 160,
          }}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <MenuItem
            label="Rename"
            onClick={() => {
              setRenaming(true);
              setMenuOpen(false);
            }}
          />
          <MenuItem
            label={chat.starred ? "Unstar" : "Star"}
            onClick={() => {
              startTransition(async () => {
                await starChat(chat.id, !chat.starred);
                setMenuOpen(false);
              });
            }}
          />
          <MenuItem
            label="Delete"
            danger
            onClick={() => {
              if (!confirm(`Delete "${chat.title}"?`)) return;
              startTransition(async () => {
                await deleteChat(chat.id);
                setMenuOpen(false);
              });
            }}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "6px 10px",
        background: "transparent",
        border: "none",
        color: danger ? "var(--danger)" : "var(--text)",
        fontSize: 13,
        cursor: "pointer",
        borderRadius: 4,
      }}
    >
      {label}
    </button>
  );
}
