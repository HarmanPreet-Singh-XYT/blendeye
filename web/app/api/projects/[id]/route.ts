import { NextRequest, NextResponse } from "next/server";
import {
  fetchProjectByIdFromSupabase,
  upsertProjectToSupabase,
  deleteProjectFromSupabase,
} from "@/lib/supabase-store";
import { isSupabaseConfigured, getAuthUserFromHeader } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 404 });
  }

  const authUser = await getAuthUserFromHeader(req.headers.get("authorization"));
  const project = await fetchProjectByIdFromSupabase(id, authUser?.id || null);
  if (!project) {
    return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body) {
    return NextResponse.json({ error: "Empty request body" }, { status: 400 });
  }

  const authUser = await getAuthUserFromHeader(req.headers.get("authorization"));
  body.id = id;
  if (authUser) {
    body.userId = authUser.id;
  }

  const success = await upsertProjectToSupabase(body, authUser?.id || body.userId || null);
  return NextResponse.json({ saved: success, id });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }

  const authUser = await getAuthUserFromHeader(req.headers.get("authorization"));
  const success = await deleteProjectFromSupabase(id, authUser?.id || null);
  return NextResponse.json({ deleted: success, id });
}

