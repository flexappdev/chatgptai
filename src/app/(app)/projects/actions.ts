"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

const TEXT_MIME_PREFIXES = ["text/", "application/json", "application/xml"];
const TEXT_EXT = new Set(["txt", "md", "markdown", "csv", "tsv", "json", "xml", "yaml", "yml", "log"]);

function isTextFile(name: string, mime: string | null): boolean {
  if (mime && TEXT_MIME_PREFIXES.some((p) => mime.startsWith(p))) return true;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return TEXT_EXT.has(ext);
}

export async function createProject(input: {
  name: string;
  description?: string;
}): Promise<string> {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Unauthorized");
  const name = input.name.trim().slice(0, 200);
  if (!name) throw new Error("Project name required");
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userData.user.id,
      name,
      description: input.description?.trim().slice(0, 500) ?? null,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Insert failed");
  revalidatePath("/projects");
  return data.id as string;
}

export async function deleteProject(id: string) {
  const supabase = await supabaseServer();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProjectInstructions(id: string, instructions: string) {
  const supabase = await supabaseServer();
  const clean = instructions.slice(0, 8000);
  const { error } = await supabase
    .from("projects")
    .update({ instructions: clean })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${id}`);
}

export async function updateProjectMemoryEnabled(id: string, enabled: boolean) {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("projects")
    .update({ memory_enabled: enabled })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${id}`);
}

export async function deleteProjectMemory(memoryId: string, projectId: string) {
  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("project_memories")
    .delete()
    .eq("id", memoryId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
}

export async function uploadProjectFile(
  projectId: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "Unauthorized" };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file" };
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "File >10MB" };
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
  const storagePath = `${userData.user.id}/${projectId}/${Date.now()}-${safeName}`;

  const { error: upErr } = await supabase.storage
    .from("project-files")
    .upload(storagePath, file, { contentType: file.type || undefined });
  if (upErr) return { ok: false, error: upErr.message };

  let extracted: string | null = null;
  if (isTextFile(file.name, file.type)) {
    const text = await file.text();
    extracted = text.slice(0, 100_000);
  }

  const { error: insErr } = await supabase.from("project_files").insert({
    user_id: userData.user.id,
    project_id: projectId,
    filename: safeName,
    storage_path: storagePath,
    mime_type: file.type || null,
    size_bytes: file.size,
    extracted_text: extracted,
  });
  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

export async function deleteProjectFile(fileId: string, projectId: string) {
  const supabase = await supabaseServer();
  const { data: file } = await supabase
    .from("project_files")
    .select("storage_path")
    .eq("id", fileId)
    .maybeSingle();
  if (file?.storage_path) {
    await supabase.storage.from("project-files").remove([file.storage_path as string]);
  }
  const { error } = await supabase.from("project_files").delete().eq("id", fileId);
  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
}
