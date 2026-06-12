"use client";

import { useCallback, useRef, useState } from "react";
import { useCanvasPanel } from "@/stores/canvasPanel";
import type { CanvasType, TextdocAttrs } from "@/lib/canvas/parser";

export type CanvasMarker = {
  index: number;
  identifier: string;
  type: CanvasType;
  title?: string;
  language?: string;
  canvasId?: string;
  version?: number;
  content: string;
  streaming?: boolean;
};

export type ClientMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  error?: boolean;
  canvases?: CanvasMarker[];
};

type StreamEvent =
  | { type: "chat_created"; chatId: string; userMessageId: string | null }
  | { type: "user_persisted"; messageId: string | null }
  | { type: "delta"; text: string }
  | { type: "canvas_open"; attrs: TextdocAttrs; index: number }
  | { type: "canvas_delta"; index: number; text: string }
  | { type: "canvas_close"; index: number }
  | { type: "canvas_persisted"; index: number; canvasId: string; version: number }
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
  const openCanvas = useCanvasPanel((s) => s.openCanvas);
  const appendCanvasDelta = useCanvasPanel((s) => s.appendDelta);
  const closeCanvasStreaming = useCanvasPanel((s) => s.closeStreaming);

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
          case "canvas_open": {
            const marker: CanvasMarker = {
              index: evt.index,
              identifier: evt.attrs.identifier,
              type: evt.attrs.type,
              title: evt.attrs.title,
              language: evt.attrs.language,
              content: "",
              streaming: true,
            };
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, canvases: [...(m.canvases ?? []), marker] }
                  : m,
              ),
            );
            openCanvas({
              identifier: marker.identifier,
              type: marker.type,
              title: marker.title,
              language: marker.language,
              content: "",
              version: 1,
              streaming: true,
            });
            break;
          }
          case "canvas_delta":
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantId || !m.canvases) return m;
                return {
                  ...m,
                  canvases: m.canvases.map((c) =>
                    c.index === evt.index ? { ...c, content: c.content + evt.text } : c,
                  ),
                };
              }),
            );
            appendCanvasDelta(evt.text);
            break;
          case "canvas_close":
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantId || !m.canvases) return m;
                return {
                  ...m,
                  canvases: m.canvases.map((c) =>
                    c.index === evt.index ? { ...c, streaming: false } : c,
                  ),
                };
              }),
            );
            closeCanvasStreaming();
            break;
          case "canvas_persisted":
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantId || !m.canvases) return m;
                return {
                  ...m,
                  canvases: m.canvases.map((c) =>
                    c.index === evt.index
                      ? { ...c, canvasId: evt.canvasId, version: evt.version }
                      : c,
                  ),
                };
              }),
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
