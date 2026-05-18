import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEV_AUTH_COOKIE, getDevUsers } from "@/lib/auth/session";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const formData = await request.formData();
  const userId = String(formData.get("userId") ?? "");
  const next = String(formData.get("next") ?? "/questions");
  const nextHref = next.startsWith("/") ? next : "/questions";
  const user = getDevUsers().find((candidate) => candidate.id === userId);

  if (!user) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const cookieStore = await cookies();
  cookieStore.set(DEV_AUTH_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.redirect(new URL(nextHref, origin));
}
