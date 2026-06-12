"use client";

import { useCallback, useRef, useState } from "react";

export type ClientMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  error?: boolean;
};

type StreamEvent =
  | { type: "chat_created"; chatId: string; userMessageId: string | null }
  | { type: "user_persisted"; messageId: string | null }
  | { type: "delta"; text: string }
  | { type: "done"; messageId: string | null }
  | { type: "error"; message: string };

export function useChatStream(opts: {
  initialMessages: ClientMessage[];
  initialChatId: string | null;
  defaultModel: string;
  onChatCreated?: (chatId: string) => void;
  projectId?: string;
}) {
  const [messages, setMessages] = useState<ClientMessage[]>(opts.initialMessages);
  const [chatId, setChatId] = useState<string | null>(opts.initialChatId);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const send = useCallback(
    async (input: { message: string; model: string; skillSlug?: string }) => {
      if (streaming || !input.message.trim()) return;
      const userId = crypto.randomUUID();
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: userId, role: "user", content: input.message },
        { id: assistantId, role: "assistant", content: "", pending: true },
      ]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            projectId: opts.projectId,
            message: input.message,
            model: input.model,
            skillSlug: input.skillSlug,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const text = await res.text().catch(() => "");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: `Error: ${res.status} ${text || res.statusText}`, pending: false, error: true }
                : m,
            ),
          );
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const evt of events) {
            const line = evt.trim();
            if (!line.startsWith("data:")) continue;
            try {
              const payload = JSON.parse(line.slice(5).trim()) as StreamEvent;
              handleEvent(payload);
            } catch {
              /* skip non-JSON heartbeat */
            }
          }
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m)),
        );
      } catch (e) {
        const err = e as Error;
        if (err.name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content || `Error: ${err.message}`, pending: false, error: true }
                : m,
            ),
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, pending: false } : m,
            ),
          );
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }

      function handleEvent(evt: StreamEvent) {
        switch (evt.type) {
          case "chat_created":
            setChatId(evt.chatId);
            opts.onChatCreated?.(evt.chatId);
            break;
          case "delta":
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + evt.text }
                  : m,
              ),
            );
            break;
          case "error":
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: evt.message, pending: false, error: true }
                  : m,
              ),
            );
            break;
          case "done":
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, pending: false } : m,
              ),
            );
            break;
        }
      }
    },
    [streaming, chatId, opts],
  );

  return { messages, chatId, streaming, send, stop, setMessages };
}
