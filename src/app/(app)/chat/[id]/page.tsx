import { notFound } from "next/navigation";
import { getChat, getMessages } from "@/lib/db";
import { ChatView } from "@/components/chat/ChatView";
import type { ClientMessage } from "@/hooks/useChatStream";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chat = await getChat(id);
  if (!chat) notFound();

  const rows = await getMessages(id);
  const messages: ClientMessage[] = rows.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
  }));

  return (
    <ChatView
      initialMessages={messages}
      initialChatId={chat.id}
      initialModel={chat.model}
      projectId={chat.project_id ?? undefined}
    />
  );
}
