"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function renameChat(chatId: string, title: string) {
  const supabase = await supabaseServer();
  const clean = title.trim().slice(0, 200) || "New chat";
  const { error } = await supabase
    .from("chats")
    .update({ title: clean })
    .eq("id", chatId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath(`/chat/${chatId}`);
}

export async function deleteChat(chatId: string) {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("chats").delete().eq("id", chatId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  redirect("/");
}

export async function starChat(chatId: string, starred: boolean) {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("chats")
    .update({ starred })
    .eq("id", chatId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function moveChatToProject(chatId: string, projectId: string | null) {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("chats")
    .update({ project_id: projectId })
    .eq("id", chatId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath(`/chat/${chatId}`);
}
