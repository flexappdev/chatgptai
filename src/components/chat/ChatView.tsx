"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { ModelPicker } from "./ModelPicker";
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
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <ModelPicker value={model} onChange={onModelChange} />
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
          send({ message: text, model, skillSlug })
        }
        onStop={stop}
        streaming={streaming}
      />
    </div>
  );
}
