"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Chats", icon: "💬" },
  { href: "/projects", label: "Projects", icon: "📁" },
  { href: "/canvas", label: "Canvas", icon: "🎨" },
  { href: "/skills", label: "Skills", icon: "🛠" },
  { href: "/connectors", label: "Connectors", icon: "🔌" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const width = collapsed ? 56 : 280;

  return (
    <aside
      aria-label="Sidebar"
      style={{
        width,
        flexShrink: 0,
        background: "var(--sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        transition: "width 0.16s ease",
      }}
    >
      <div
        style={{
          padding: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid var(--border)",
          minHeight: 56,
        }}
      >
        {!collapsed && (
          <Link
            href="/"
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: "var(--text)",
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            chatgptai
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            height: 32,
            width: 32,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-control)",
            background: "transparent",
            color: "var(--text-muted)",
            border: "none",
            cursor: "pointer",
          }}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <div style={{ padding: 12 }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 8,
            height: 40,
            padding: collapsed ? 0 : "0 14px",
            borderRadius: "var(--radius-pill)",
            background: "var(--btn)",
            color: "var(--btn-fg)",
            fontWeight: 500,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          <span>＋</span>
          {!collapsed && <span>New chat</span>}
        </Link>
      </div>

      <nav style={{ padding: "0 8px", display: "grid", gap: 2 }}>
        {NAV.map((item) => {
          const active = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 36,
                padding: collapsed ? 0 : "0 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "var(--radius-control)",
                background: active ? "var(--surface)" : "transparent",
                color: active ? "var(--text)" : "var(--text-muted)",
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <span aria-hidden>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: 16,
          padding: "0 12px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {!collapsed && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "8px 4px",
            }}
          >
            Recents
          </div>
        )}
        {/* RecentsList mounts here in CC-04 */}
        {!collapsed && (
          <div
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              padding: "4px",
              lineHeight: 1.5,
            }}
          >
            No chats yet.
          </div>
        )}
      </div>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 8,
        }}
      >
        {/* UserMenu — fills in CC-04 with avatar + sign out */}
        {!collapsed && (
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Signed in</span>
        )}
      </div>
    </aside>
  );
}
