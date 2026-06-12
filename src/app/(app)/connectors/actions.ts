"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { getConnectorDef } from "@/lib/connectors/registry";

export async function setConnectorStatus(
  provider: string,
  status: "connected" | "disconnected",
) {
  const def = getConnectorDef(provider);
  if (!def) throw new Error(`Unknown connector: ${provider}`);
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("connectors")
    .upsert(
      {
        user_id: userData.user.id,
        provider,
        label: def.label,
        status,
        enabled: true,
      },
      { onConflict: "user_id,provider" },
    );
  if (error) throw new Error(error.message);
  revalidatePath("/connectors");
}
