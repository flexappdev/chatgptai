"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { ModelPicker } from "./ModelPicker";
import { ToolsPopover, type ConnectedConnector } from "./ToolsPopover";
import { useChatStream, type ClientMessage } from "@/hooks/useChatStream";
import { DEFAULT_MODEL } from "@/lib/openrouter";

const MODEL_COOKIE = "chatgptai_model";

export function ChatView({
  initialMessages,
  initialChatId,
  initialModel,
  projectId,
}: {
  initialMessages: ClientMessage[];
  initialChatId: string | null;
  initialModel?: string;
  projectId?: string;
}) {
  const router = useRouter();
  const [model, setModel] = useState<string>(initialModel ?? DEFAULT_MODEL);
  const [available, setAvailable] = useState<ConnectedConnector[]>([]);
  const [enabledTools, setEnabledTools] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/connectors/connected")
      .then((r) => r.json())
      .then((j) => setAvailable(j.connectors ?? []))
      .catch(() => setAvailable([]));
  }, []);

  const toggleTool = (provider: string) => {
    setEnabledTools((s) => {
      const next = new Set(s);
      if (next.has(provider)) next.delete(provider);
      else next.add(provider);
      return next;
    });
  };

  const { messages, streaming, send, stop } = useChatStream({
    initialMessages,
    initialChatId,
    defaultModel: model,
    projectId,
    onChatCreated(id) {
      // Replace the URL without unmounting — server actions revalidate.
      router.replace(`/chat/${id}`);
      router.refresh();
    },
  });

  const onModelChange = (id: string) => {
    setModel(id);
    document.cookie = `${MODEL_COOKIE}=${id}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "10px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg)",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <ModelPicker value={model} onChange={onModelChange} />
          <ToolsPopover
            available={available}
            enabled={enabledTools}
            onToggle={toggleTool}
          />
        </div>
      </div>

      {messages.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 500,
              letterSpacing: "-0.01em",
              marginBottom: 16,
            }}
          >
            What can I help with?
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Type below to start a new chat.
          </p>
        </div>
      ) : (
        <MessageList messages={messages} />
      )}

      <Composer
        onSend={({ text, skillSlug }) =>
          send({
            message: text,
            model,
            skillSlug,
            enabledTools: Array.from(enabledTools),
          })
        }
        onStop={stop}
        streaming={streaming}
      />
    </div>
  );
}
