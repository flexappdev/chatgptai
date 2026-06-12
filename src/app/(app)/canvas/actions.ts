"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import type { CanvasType } from "@/lib/canvas/parser";

export async function saveCanvasEdit(input: {
  identifier: string;
  type: CanvasType;
  title?: string;
  language?: string;
  content: string;
  chatId?: string;
}) {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Unauthorized");

  // Find max version for this identifier
  const { data: existing } = await supabase
    .from("canvases")
    .select("version")
    .eq("identifier", input.identifier)
    .order("version", { ascending: false })
    .limit(1);
  const nextVersion = ((existing?.[0]?.version as number | undefined) ?? 0) + 1;

  const { error } = await supabase.from("canvases").insert({
    user_id: userData.user.id,
    chat_id: input.chatId ?? null,
    identifier: input.identifier,
    title: input.title ?? null,
    type: input.type,
    language: input.language ?? null,
    content: input.content,
    version: nextVersion,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/canvas");
}

export async function deleteCanvas(identifier: string) {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("canvases")
    .delete()
    .eq("identifier", identifier);
  if (error) throw new Error(error.message);
  revalidatePath("/canvas");
}
