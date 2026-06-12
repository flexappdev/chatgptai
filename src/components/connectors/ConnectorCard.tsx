"use client";

import { useTransition } from "react";
import { setConnectorStatus } from "@/app/(app)/connectors/actions";
import type { ConnectorDef } from "@/lib/connectors/registry";
import type { ConnectorRow } from "@/lib/database.types";

export function ConnectorCard({
  def,
  connector,
  braveConfigured,
}: {
  def: ConnectorDef;
  connector: ConnectorRow | null;
  braveConfigured: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const connected = connector?.status === "connected";
  const setupNeeded = def.provider === "web_search" && !braveConfigured;

  const toggle = () => {
    startTransition(async () => {
      await setConnectorStatus(
        def.provider,
        connected ? "disconnected" : "connected",
      );
    });
  };

  return (
    <article
      style={{
        padding: 16,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>{def.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{def.label}</div>
          <div
            style={{
              fontSize: 11,
              color: connected ? "var(--ok)" : "var(--text-muted)",
              marginTop: 2,
            }}
          >
            {connected ? "● connected" : "○ disconnected"}
            {!def.real && " · demo"}
            {setupNeeded && " · setup needed"}
          </div>
        </div>
      </div>
      <p
        style={{
          fontSize: 12,
          color: "var(--text-muted)",
          lineHeight: 1.55,
          margin: 0,
          flex: 1,
        }}
      >
        {def.description}
      </p>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        style={{
          height: 32,
          padding: "0 14px",
          background: connected ? "transparent" : "var(--btn)",
          color: connected ? "var(--text)" : "var(--btn-fg)",
          border: connected ? "1px solid var(--border-strong)" : "none",
          borderRadius: "var(--radius-pill)",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        {pending ? "…" : connected ? "Disconnect" : "Connect"}
      </button>
    </article>
  );
}
