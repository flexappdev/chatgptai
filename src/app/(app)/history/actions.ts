"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import type { ChatRow } from "@/lib/database.types";

export type HistoryResult = {
  chats: ChatRow[];
  snippets: Record<string, string>;
  nextCursor: string | null;
};

const PAGE_SIZE = 30;

export async function searchHistory(
  query: string,
  cursor: string | null = null,
): Promise<HistoryResult> {
  const supabase = await supabaseServer();
  const q = query.trim();

  if (!q) {
    let req = supabase
      .from("chats")
      .select("*")
      .order("last_message_at", { ascending: false })
      .limit(PAGE_SIZE);
    if (cursor) req = req.lt("last_message_at", cursor);
    const { data } = await req;
    const chats = (data ?? []) as ChatRow[];
    const nextCursor =
      chats.length === PAGE_SIZE ? chats[chats.length - 1]!.last_message_at : null;
    return { chats, snippets: {}, nextCursor };
  }

  const ilike = `%${q.replace(/[%_]/g, "\\$&")}%`;
  // Title hits
  const { data: titleHits } = await supabase
    .from("chats")
    .select("*")
    .ilike("title", ilike)
    .order("last_message_at", { ascending: false })
    .limit(PAGE_SIZE);

  // Message body hits → fetch chats indirectly
  const { data: msgHits } = await supabase
    .from("messages")
    .select("chat_id, content")
    .ilike("content", ilike)
    .order("created_at", { ascending: false })
    .limit(60);

  const chatIds = Array.from(
    new Set((msgHits ?? []).map((m: { chat_id: string }) => m.chat_id)),
  );
  const snippets: Record<string, string> = {};
  for (const m of (msgHits ?? []) as { chat_id: string; content: string }[]) {
    if (snippets[m.chat_id]) continue;
    const idx = m.content.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) {
      snippets[m.chat_id] = m.content.slice(0, 160);
    } else {
      const start = Math.max(0, idx - 40);
      const end = Math.min(m.content.length, idx + q.length + 100);
      snippets[m.chat_id] =
        (start > 0 ? "…" : "") + m.content.slice(start, end) + (end < m.content.length ? "…" : "");
    }
  }

  let extraChats: ChatRow[] = [];
  if (chatIds.length > 0) {
    const { data } = await supabase
      .from("chats")
      .select("*")
      .in("id", chatIds)
      .order("last_message_at", { ascending: false });
    extraChats = (data ?? []) as ChatRow[];
  }

  const byId = new Map<string, ChatRow>();
  for (const c of (titleHits ?? []) as ChatRow[]) byId.set(c.id, c);
  for (const c of extraChats) byId.set(c.id, c);

  const chats = Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.last_message_at).getTime() -
      new Date(a.last_message_at).getTime(),
  );

  return { chats, snippets, nextCursor: null };
}

export async function deleteChats(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = await supabaseServer();
  const { error } = await supabase.from("chats").delete().in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/history");
}
