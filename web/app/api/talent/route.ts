import { NextRequest, NextResponse } from "next/server";
import {
  fetchTalentFromSupabase,
  upsertTalentToSupabase,
  deleteTalentFromSupabase,
} from "@/lib/supabase-store";
import { isSupabaseConfigured, getAuthUserFromHeader } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ talent: [], configured: false });
  }

  const authUser = await getAuthUserFromHeader(req.headers.get("authorization"));
  const talent = await fetchTalentFromSupabase(authUser?.id || null);
  return NextResponse.json({ talent: talent || [], configured: true });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || !body.name) {
    return NextResponse.json({ error: "Character name is required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ saved: false, configured: false });
  }

  const authUser = await getAuthUserFromHeader(req.headers.get("authorization"));
  const success = await upsertTalentToSupabase(body, authUser?.id || null);
  return NextResponse.json({ saved: success, name: body.name });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Character name is required" }, { status: 400 });
  }

  const authUser = await getAuthUserFromHeader(req.headers.get("authorization"));
  const success = await deleteTalentFromSupabase(name, authUser?.id || null);
  return NextResponse.json({ deleted: success, name });
}
