import { NextResponse } from "next/server";
import { resetMvpStore } from "@/lib/mvp/store";
import { serverError } from "@/lib/mvp/http";

export const runtime = "nodejs";

export async function POST() {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    await resetMvpStore();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
