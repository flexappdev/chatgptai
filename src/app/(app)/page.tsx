import { cookies } from "next/headers";
import { ChatView } from "@/components/chat/ChatView";
import { DEFAULT_MODEL, isValidModel } from "@/lib/openrouter";

export default async function HomePage() {
  const cookieStore = await cookies();
  const stored = cookieStore.get("chatgptai_model")?.value;
  const initialModel = stored && isValidModel(stored) ? stored : DEFAULT_MODEL;

  return (
    <ChatView
      initialMessages={[]}
      initialChatId={null}
      initialModel={initialModel}
    />
  );
}
