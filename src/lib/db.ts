import { supabaseServer } from "@/lib/supabase/server";
import type {
  ChatRow,
  MessageRow,
  ProjectRow,
  CanvasRow,
  SkillRow,
  ConnectorRow,
} from "@/lib/database.types";

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function getChats(limit = 50): Promise<ChatRow[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("chats")
    .select("*")
    .order("last_message_at", { ascending: false })
    .limit(limit);
  return (data as ChatRow[]) ?? [];
}

export async function getChat(id: string): Promise<ChatRow | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("chats")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as ChatRow) ?? null;
}

export async function getMessages(chatId: string): Promise<MessageRow[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });
  return (data as MessageRow[]) ?? [];
}

export async function getProjects(): Promise<ProjectRow[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });
  return (data as ProjectRow[]) ?? [];
}

export async function getProject(id: string): Promise<ProjectRow | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as ProjectRow) ?? null;
}

export async function getCanvasesForChat(chatId: string): Promise<CanvasRow[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("canvases")
    .select("*")
    .eq("chat_id", chatId)
    .order("updated_at", { ascending: false });
  return (data as CanvasRow[]) ?? [];
}

export async function getEnabledSkills(): Promise<SkillRow[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("enabled", true)
    .order("name");
  return (data as SkillRow[]) ?? [];
}

export async function getSkillBySlug(slug: string): Promise<SkillRow | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as SkillRow) ?? null;
}

export async function getConnectors(): Promise<ConnectorRow[]> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("connectors")
    .select("*")
    .order("provider");
  return (data as ConnectorRow[]) ?? [];
}
