import Link from "next/link";
import { getProjects } from "@/lib/db";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.01em" }}>
          Projects
        </h1>
        <NewProjectDialog />
      </div>

      {projects.length === 0 ? (
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
          No projects yet. Create one to group related chats with shared
          instructions, knowledge files, and memory.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              style={{
                display: "block",
                padding: 16,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-card)",
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 500 }}>{p.name}</div>
              {p.description && (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginTop: 6,
                    lineHeight: 1.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {p.description}
                </div>
              )}
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 8,
                }}
              >
                Updated {new Date(p.updated_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
