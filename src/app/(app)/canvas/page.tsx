import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import type { CanvasRow } from "@/lib/database.types";

export default async function CanvasLibraryPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("canvases")
    .select("*")
    .order("updated_at", { ascending: false });
  const rows = (data ?? []) as CanvasRow[];

  // Keep only the latest version per identifier
  const seen = new Set<string>();
  const latest: CanvasRow[] = [];
  for (const r of rows) {
    if (seen.has(r.identifier)) continue;
    seen.add(r.identifier);
    latest.push(r);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          marginBottom: 16,
        }}
      >
        Canvas
      </h1>
      {latest.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          Canvases from your chats will appear here.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {latest.map((c) => (
            <Link
              key={c.id}
              href={`/canvas/${c.id}`}
              style={{
                display: "block",
                padding: 14,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-card)",
                color: "var(--text)",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {c.title || c.identifier}
              </div>
              <div
                style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}
              >
                {c.type}
                {c.language ? ` · ${c.language}` : ""} · v{c.version}
              </div>
              <div
                style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}
              >
                {new Date(c.updated_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
