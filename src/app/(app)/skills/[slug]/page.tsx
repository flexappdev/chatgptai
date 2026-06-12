import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Markdown } from "@/components/chat/Markdown";
import { SkillEditor } from "@/components/skills/SkillEditor";
import type { SkillRow } from "@/lib/database.types";

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  const skill = data as SkillRow | null;
  if (!skill) notFound();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <header style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.01em" }}>
          {skill.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 6,
            fontFamily: "var(--font-mono)",
          }}
        >
          /{skill.slug}
        </div>
        {skill.description && (
          <p style={{ marginTop: 8, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {skill.description}
          </p>
        )}
      </header>
      <SkillEditor skill={skill} />
    </div>
  );
}

export const dynamic = "force-dynamic";
