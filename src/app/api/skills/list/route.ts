import { NextResponse } from "next/server";
import { getEnabledSkills } from "@/lib/db";

export async function GET() {
  const skills = await getEnabledSkills();
  return NextResponse.json({ skills });
}
