import { supabaseServer } from "@/lib/supabase/server";
import { SkillDialog } from "@/components/skills/SkillDialog";
import { SkillRow } from "@/components/skills/SkillRow";
import type { SkillRow as SkillRowType } from "@/lib/database.types";

export default async function SkillsPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("skills")
    .select("*")
    .order("updated_at", { ascending: false });
  const skills = (data ?? []) as SkillRowType[];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.01em" }}>
          Skills
        </h1>
        <SkillDialog />
      </div>
      {skills.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 14,
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius-card)",
          }}
        >
          No skills yet. Add a SKILL.md file or write one inline to inject
          custom instructions into a chat via <code>/your-skill</code>.
        </div>
      ) : (
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-card)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface)", fontSize: 12, color: "var(--text-muted)" }}>
                <th style={head}>Name</th>
                <th style={head}>Slug</th>
                <th style={head}>Description</th>
                <th style={head}>Enabled</th>
                <th style={head}></th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <SkillRow key={s.id} skill={s} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const head: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: 500,
};
