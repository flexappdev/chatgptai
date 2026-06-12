"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { parseSkillFile, slugify } from "@/lib/skills";

export async function createSkillFromMarkdown(source: string): Promise<string> {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Unauthorized");
  const parsed = parseSkillFile(source);
  const { error } = await supabase.from("skills").insert({
    user_id: userData.user.id,
    name: parsed.name,
    slug: parsed.slug,
    description: parsed.description,
    content: parsed.content,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/skills");
  return parsed.slug;
}

export async function createSkill(input: {
  name: string;
  description?: string;
  content: string;
}): Promise<string> {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Unauthorized");
  const name = input.name.trim();
  if (!name) throw new Error("Name required");
  const slug = slugify(name);
  const { error } = await supabase.from("skills").insert({
    user_id: userData.user.id,
    name,
    slug,
    description: input.description?.trim() ?? null,
    content: input.content.slice(0, 64 * 1024),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/skills");
  return slug;
}

export async function updateSkill(
  slug: string,
  input: { name?: string; description?: string; content?: string; enabled?: boolean },
) {
  const supabase = await supabaseServer();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.description !== undefined) patch.description = input.description.trim() || null;
  if (input.content !== undefined) patch.content = input.content.slice(0, 64 * 1024);
  if (input.enabled !== undefined) patch.enabled = input.enabled;
  const { error } = await supabase
    .from("skills")
    .update(patch)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/skills");
  revalidatePath(`/skills/${slug}`);
}

export async function deleteSkill(slug: string) {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("skills").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/skills");
  redirect("/skills");
}
