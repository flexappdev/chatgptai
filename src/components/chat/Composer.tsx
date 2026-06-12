"use client";

import { useRef, useState, useEffect } from "react";
import { SlashMenu } from "./SlashMenu";
import type { SkillRow } from "@/lib/database.types";

export type ComposerSubmit = {
  text: string;
  skillSlug?: string;
};

export function Composer({
  onSend,
  onStop,
  streaming,
  placeholder = "Message chatgptai…",
  autoFocus = true,
}: {
  onSend: (input: ComposerSubmit) => void;
  onStop: () => void;
  streaming: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState("");
  const [skill, setSkill] = useState<SkillRow | null>(null);
  const [slashFilter, setSlashFilter] = useState<string | null>(null);
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

  // Slash filter: only when text starts with `/` and no skill chip yet
  useEffect(() => {
    if (skill) {
      setSlashFilter(null);
      return;
    }
    if (text.startsWith("/")) {
      const space = text.indexOf(" ");
      setSlashFilter(space === -1 ? text.slice(1) : null);
    } else {
      setSlashFilter(null);
    }
  }, [text, skill]);

  const submit = () => {
    if (!text.trim() || streaming) return;
    onSend({ text: text.trim(), skillSlug: skill?.slug });
    setText("");
    setSkill(null);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace" && skill && text === "") {
      e.preventDefault();
      setSkill(null);
      return;
    }
    if (slashFilter !== null) return; // arrows/enter handled in SlashMenu
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div style={{ padding: "12px 24px 18px", background: "var(--bg)", position: "relative" }}>
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          position: "relative",
        }}
      >
        {slashFilter !== null && (
          <SlashMenu
            filter={slashFilter}
            onPick={(s) => {
              setSkill(s);
              setText("");
            }}
            onClose={() => setSlashFilter(null)}
          />
        )}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-pill)",
            padding: "10px 12px 10px 20px",
          }}
        >
          {skill && (
            <span
              style={{
                flexShrink: 0,
                padding: "4px 10px",
                background: "color-mix(in srgb, var(--ok) 22%, transparent)",
                color: "var(--text)",
                borderRadius: 999,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
              }}
            >
              /{skill.slug}
            </span>
          )}
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder={skill ? `Using ${skill.name} — type your message` : placeholder}
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
              style={sendBtn(true)}
            >
              ■
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!text.trim()}
              aria-label="Send message"
              style={sendBtn(false, !!text.trim())}
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
    </div>
  );
}

function sendBtn(stop: boolean, ready = true): React.CSSProperties {
  return {
    flexShrink: 0,
    height: 36,
    width: 36,
    borderRadius: 18,
    border: "none",
    background: stop || ready ? "var(--btn)" : "var(--border-strong)",
    color: "var(--btn-fg)",
    cursor: stop || ready ? "pointer" : "not-allowed",
    opacity: stop || ready ? 1 : 0.6,
    fontWeight: 600,
    fontSize: stop ? 12 : 14,
  };
}
