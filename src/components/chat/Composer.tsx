"use client";

import { useRef, useState, useEffect } from "react";

export function Composer({
  onSend,
  onStop,
  streaming,
  placeholder = "Message chatgptai…",
  autoFocus = true,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 240);
    el.style.height = `${next}px`;
  }, [text]);

  const submit = () => {
    if (!text.trim() || streaming) return;
    onSend(text.trim());
    setText("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div style={{ padding: "12px 24px 18px", background: "var(--bg)" }}>
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-pill)",
          padding: "10px 12px 10px 20px",
        }}
      >
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          placeholder={placeholder}
          aria-label="Compose message"
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            color: "var(--text)",
            fontSize: 15,
            lineHeight: 1.55,
            fontFamily: "inherit",
            maxHeight: 240,
            padding: "6px 0",
          }}
        />
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            style={{
              flexShrink: 0,
              height: 36,
              width: 36,
              borderRadius: 18,
              border: "none",
              background: "var(--btn)",
              color: "var(--btn-fg)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            ■
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim()}
            aria-label="Send message"
            style={{
              flexShrink: 0,
              height: 36,
              width: 36,
              borderRadius: 18,
              border: "none",
              background: text.trim() ? "var(--btn)" : "var(--border-strong)",
              color: "var(--btn-fg)",
              cursor: text.trim() ? "pointer" : "not-allowed",
              opacity: text.trim() ? 1 : 0.6,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            ↑
          </button>
        )}
      </div>
      <p
        style={{
          textAlign: "center",
          marginTop: 8,
          fontSize: 11,
          color: "var(--text-muted)",
        }}
      >
        chatgptai can make mistakes. Verify important info.
      </p>
    </div>
  );
}
