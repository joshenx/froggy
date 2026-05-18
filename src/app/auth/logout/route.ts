import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEV_AUTH_COOKIE } from "@/lib/auth/session";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;

  if (isSupabaseAuthConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } else {
    const cookieStore = await cookies();
    cookieStore.delete(DEV_AUTH_COOKIE);
  }

  return NextResponse.redirect(new URL("/login", origin));
}
