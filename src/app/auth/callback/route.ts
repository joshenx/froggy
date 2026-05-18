import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const nextHref = next && next.startsWith("/") ? next : "/questions";

  if (!isSupabaseAuthConfigured()) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(nextHref, origin));
}
