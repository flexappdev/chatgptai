"use client";

import { Markdown } from "./Markdown";
import { CanvasCard } from "@/components/canvas/CanvasCard";
import type { ClientMessage } from "@/hooks/useChatStream";

export function Message({ message }: { message: ClientMessage }) {
  if (message.role === "user") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "8px 0",
        }}
      >
        <div
          style={{
            maxWidth: "min(80%, 720px)",
            background: "var(--bubble)",
            color: "var(--text)",
            padding: "12px 18px",
            borderRadius: "var(--radius-pill)",
            fontSize: 15,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px 0" }}>
      <div
        style={{
          color: message.error ? "var(--danger)" : "var(--text)",
          fontSize: 15,
        }}
      >
        {message.content ? (
          <Markdown content={message.content} />
        ) : message.pending && (!message.canvases || message.canvases.length === 0) ? (
          <BreathingDot />
        ) : null}
        {message.pending && message.content && <InlineCursor />}
        {message.canvases?.map((c) => (
          <CanvasCard
            key={`${c.index}-${c.identifier}`}
            identifier={c.identifier}
            title={c.title}
            type={c.type}
            language={c.language}
            content={c.content}
            streaming={c.streaming}
            canvasId={c.canvasId}
            version={c.version}
          />
        ))}
      </div>
    </div>
  );
}

function BreathingDot() {
  return (
    <span
      aria-label="Assistant is typing"
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        borderRadius: 8,
        background: "var(--text)",
        animation: "chatgptai-pulse 1.4s ease-in-out infinite",
      }}
    >
      <style>{`@keyframes chatgptai-pulse {0%,100%{opacity:.25;transform:scale(.9)}50%{opacity:1;transform:scale(1)}}`}</style>
    </span>
  );
}

function InlineCursor() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: 10,
        height: 16,
        marginLeft: 2,
        verticalAlign: "text-bottom",
        background: "var(--text)",
        borderRadius: 2,
        animation: "chatgptai-blink 1s steps(2) infinite",
      }}
    >
      <style>{`@keyframes chatgptai-blink {0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </span>
  );
}
