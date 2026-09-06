import { NextRequest, NextResponse } from "next/server";
import { fetchProjectsFromSupabase, upsertProjectToSupabase } from "@/lib/supabase-store";
import { isSupabaseConfigured, getAuthUserFromHeader } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      projects: [],
      configured: false,
      message: "Supabase not configured; client using local state.",
    });
  }

  // Extract authenticated user if present
  const authUser = await getAuthUserFromHeader(req.headers.get("authorization"));
  const projects = await fetchProjectsFromSupabase(authUser?.id || null);

  if (projects === null) {
    return NextResponse.json({
      projects: [],
      configured: true,
      tablesReady: false,
      message: "Supabase tables not yet initialized. Run supabase/schema.sql in Supabase SQL editor.",
    });
  }

  return NextResponse.json({
    projects,
    configured: true,
    tablesReady: true,
    user: authUser ? { id: authUser.id, email: authUser.email } : null,
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || !body.id || !body.title) {
    return NextResponse.json({ error: "Project id and title are required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      saved: false,
      configured: false,
      message: "Supabase not configured; stored locally only.",
    });
  }

  // Bind project to authenticated user if session is provided
  const authUser = await getAuthUserFromHeader(req.headers.get("authorization"));
  const effectiveUserId = authUser?.id || body.userId || null;

  if (authUser) {
    body.userId = authUser.id;
  }

  const success = await upsertProjectToSupabase(body, effectiveUserId);
  return NextResponse.json({
    saved: success,
    configured: true,
    id: body.id,
    userId: effectiveUserId,
  });
}

