import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { CONNECTOR_REGISTRY } from "@/lib/connectors/registry";

export async function GET() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("connectors")
    .select("provider, status, enabled");
  const connected = new Set(
    (data ?? [])
      .filter(
        (r: { provider: string; status: string; enabled: boolean }) =>
          r.status === "connected" && r.enabled,
      )
      .map((r: { provider: string }) => r.provider),
  );
  const items = CONNECTOR_REGISTRY.filter((c) => connected.has(c.provider)).map(
    (c) => ({ provider: c.provider, label: c.label, icon: c.icon }),
  );
  return NextResponse.json({ connectors: items });
}
