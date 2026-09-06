import { NextRequest, NextResponse } from "next/server";
import { generateScript } from "@/lib/agent-service";
import { getCachedGeneration, setCachedGeneration } from "@/lib/generation-cache";
import { getSupabaseAdminClient, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const premise = typeof body?.premise === "string" ? body.premise.trim() : "";

  if (!premise) {
    return NextResponse.json({ error: "premise is required" }, { status: 400 });
  }

  try {
    const cached = await getCachedGeneration<{ screenplay_text: string }>("script", { premise });
    if (cached && cached.screenplay_text) {
      return NextResponse.json({ ...cached, _cached: true });
    }

    const result = await generateScript(premise);
    if (result && result.screenplay_text) {
      await setCachedGeneration("script", { premise }, result);

      const projectId = typeof body?.projectId === "string" ? body.projectId.trim() : "";
      if (projectId && isSupabaseConfigured()) {
        try {
          const client = getSupabaseAdminClient() || getSupabaseClient();
          if (client) {
            await client
              .from("projects")
              .update({
                screenplay_text: result.screenplay_text,
                updated_at: Date.now(),
              })
              .eq("id", projectId);
          }
        } catch (dbErr) {
          console.warn("[ScriptGenerate] Supabase screenplay persist warning:", dbErr);
        }
      }
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "generation failed" },
      { status: 502 }
    );
  }
}
