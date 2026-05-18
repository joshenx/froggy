import { NextResponse, type NextRequest } from "next/server";
import { DEV_AUTH_COOKIE } from "@/lib/auth/session";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";
import { updateSupabaseProxySession } from "@/lib/supabase/proxy";

const protectedPageMatchers = [
  /^\/roles(?:\/.*)?$/,
  /^\/questions(?:\/.*)?$/,
  /^\/candidates(?:\/.*)?$/,
  /^\/settings\/integrations(?:\/.*)?$/,
  /^\/integrations(?:\/.*)?$/,
  /^\/interviews(?:\/.*)?$/,
  /^\/packets(?:\/.*)?$/,
  /^\/companies(?:\/.*)?$/,
];

const protectedApiMatchers = [
  /^\/api\/roles(?:\/.*)?$/,
  /^\/api\/stages(?:\/.*)?$/,
  /^\/api\/questions(?:\/.*)?$/,
  /^\/api\/interview-sessions(?:\/.*)?$/,
  /^\/api\/applications(?:\/.*)?$/,
  /^\/api\/integrations(?:\/.*)?$/,
  /^\/api\/companies(?:\/.*)?$/,
];

function isProtectedPage(pathname: string) {
  return protectedPageMatchers.some((matcher) => matcher.test(pathname));
}

function isProtectedApi(pathname: string) {
  return protectedApiMatchers.some((matcher) => matcher.test(pathname));
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!isProtectedPage(pathname) && !isProtectedApi(pathname)) {
    return NextResponse.next();
  }

  if (!isSupabaseAuthConfigured()) {
    const devUserId = request.cookies.get(DEV_AUTH_COOKIE)?.value;
    if (devUserId) {
      return NextResponse.next();
    }

    if (isProtectedApi(pathname)) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    return redirectToLogin(request);
  }

  const { response, hasUser } = await updateSupabaseProxySession(request);

  if (hasUser) {
    return response;
  }

  if (isProtectedApi(pathname)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  return redirectToLogin(request);
}

export const config = {
  matcher: [
    "/roles/:path*",
    "/questions/:path*",
    "/candidates/:path*",
    "/settings/integrations/:path*",
    "/integrations/:path*",
    "/interviews/:path*",
    "/packets/:path*",
    "/companies/:path*",
    "/api/roles/:path*",
    "/api/stages/:path*",
    "/api/questions/:path*",
    "/api/interview-sessions/:path*",
    "/api/applications/:path*",
    "/api/integrations/:path*",
    "/api/companies/:path*",
  ],
};
