import { NextRequest, NextResponse } from "next/server";
import {
  fetchNotesFromSupabase,
  upsertNoteToSupabase,
  deleteNoteFromSupabase,
} from "@/lib/supabase-store";
import { isSupabaseConfigured, getAuthUserFromHeader } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") || undefined;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ notes: [], configured: false });
  }

  const authUser = await getAuthUserFromHeader(req.headers.get("authorization"));
  const notes = await fetchNotesFromSupabase(projectId, authUser?.id || null);
  return NextResponse.json({ notes: notes || [], configured: true });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || !body.id || !body.title) {
    return NextResponse.json({ error: "id and title required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ saved: false, configured: false });
  }

  const authUser = await getAuthUserFromHeader(req.headers.get("authorization"));
  const success = await upsertNoteToSupabase(body, authUser?.id || body.userId || null);
  return NextResponse.json({ saved: success, id: body.id });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const authUser = await getAuthUserFromHeader(req.headers.get("authorization"));
  const success = await deleteNoteFromSupabase(id, authUser?.id || null);
  return NextResponse.json({ deleted: success, id });
}

