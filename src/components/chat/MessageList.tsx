"use client";

import { useEffect, useRef } from "react";
import { Message } from "./Message";
import type { ClientMessage } from "@/hooks/useChatStream";

export function MessageList({ messages }: { messages: ClientMessage[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 240;
    if (nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={ref}
      role="log"
      aria-live="polite"
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 0",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
      </div>
    </div>
  );
}
