import { supabaseServer } from "@/lib/supabase/server";
import { CONNECTOR_REGISTRY } from "@/lib/connectors/registry";
import { ConnectorCard } from "@/components/connectors/ConnectorCard";
import type { ConnectorRow } from "@/lib/database.types";

export default async function ConnectorsPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.from("connectors").select("*");
  const rows = (data ?? []) as ConnectorRow[];
  const byProvider = new Map(rows.map((r) => [r.provider, r]));

  const braveConfigured = process.env.BRAVE_API_KEY ? true : false;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          marginBottom: 16,
        }}
      >
        Connectors
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.55,
          marginBottom: 24,
        }}
      >
        Connect tools the model can call mid-conversation. Web Search hits Brave
        Search when <code>BRAVE_API_KEY</code> is set; everything else is a demo
        stub the model knows about.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {CONNECTOR_REGISTRY.map((c) => (
          <ConnectorCard
            key={c.provider}
            def={c}
            connector={byProvider.get(c.provider) ?? null}
            braveConfigured={braveConfigured}
          />
        ))}
      </div>
    </div>
  );
}
