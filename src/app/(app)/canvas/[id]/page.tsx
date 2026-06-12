import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Markdown } from "@/components/chat/Markdown";
import { HtmlPreview } from "@/components/canvas/previews/HtmlPreview";
import { ReactPreview } from "@/components/canvas/previews/ReactPreview";
import { MermaidPreview } from "@/components/canvas/previews/MermaidPreview";
import type { CanvasRow } from "@/lib/database.types";

export default async function CanvasViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("canvases")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const canvas = data as CanvasRow | null;
  if (!canvas) notFound();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <header
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            {canvas.title || canvas.identifier}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            {canvas.type}
            {canvas.language ? ` · ${canvas.language}` : ""} · v{canvas.version}
          </div>
        </div>
      </header>
      <main style={{ flex: 1, overflow: "auto" }}>
        {canvas.type === "document" && (
          <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
            <Markdown content={canvas.content} />
          </div>
        )}
        {canvas.type === "code" && (
          <pre
            style={{
              margin: 0,
              padding: 24,
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              lineHeight: 1.6,
              background: "var(--code-bg)",
              color: "var(--text)",
              height: "100%",
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {canvas.content}
          </pre>
        )}
        {canvas.type === "html" && <HtmlPreview html={canvas.content} />}
        {canvas.type === "svg" && <HtmlPreview html={canvas.content} />}
        {canvas.type === "react" && <ReactPreview code={canvas.content} />}
        {canvas.type === "mermaid" && <MermaidPreview code={canvas.content} />}
      </main>
    </div>
  );
}
