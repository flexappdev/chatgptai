import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { getProject } from "@/lib/db";
import { InstructionsCard } from "@/components/projects/InstructionsCard";
import { KnowledgeCard } from "@/components/projects/KnowledgeCard";
import { MemoryCard } from "@/components/projects/MemoryCard";
import { ChatView } from "@/components/chat/ChatView";
import type {
  ChatRow,
  ProjectFileRow,
  ProjectMemoryRow,
} from "@/lib/database.types";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const supabase = await supabaseServer();
  const [{ data: filesData }, { data: memData }, { data: chatData }] = await Promise.all([
    supabase
      .from("project_files")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_memories")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("chats")
      .select("*")
      .eq("project_id", id)
      .order("last_message_at", { ascending: false }),
  ]);

  const files = (filesData ?? []) as ProjectFileRow[];
  const memories = (memData ?? []) as ProjectMemoryRow[];
  const chats = (chatData ?? []) as ChatRow[];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: 16,
        padding: 16,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 500 }}>{project.name}</div>
          {project.description && (
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                marginTop: 4,
              }}
            >
              {project.description}
            </div>
          )}
          {chats.length > 0 && (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {chats.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/chat/${c.id}`}
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    background: "var(--surface)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                    borderRadius: 999,
                    textDecoration: "none",
                  }}
                >
                  {c.title}
                </Link>
              ))}
            </div>
          )}
        </header>
        <ChatView
          initialMessages={[]}
          initialChatId={null}
          initialModel={undefined}
          projectId={project.id}
        />
      </div>

      <aside
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflowY: "auto",
        }}
      >
        <InstructionsCard projectId={project.id} initial={project.instructions} />
        <KnowledgeCard projectId={project.id} files={files} />
        <MemoryCard
          projectId={project.id}
          enabled={project.memory_enabled}
          memories={memories}
        />
      </aside>
    </div>
  );
}
