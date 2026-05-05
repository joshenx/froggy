import { NextRequest, NextResponse } from "next/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body === "object" && body !== null && "email" in body ? String(body.email).trim().toLowerCase() : "";

  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Waitlist is not configured yet. Missing Supabase environment variables." },
      { status: 500 },
    );
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/interested_users`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      authorization: `Bearer ${supabaseKey}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      email,
      source: "froggy-landing",
      user_agent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Supabase waitlist insert failed", details);
    return NextResponse.json({ error: "Could not join the waitlist yet. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
