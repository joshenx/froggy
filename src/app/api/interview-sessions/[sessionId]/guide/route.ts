import { NextResponse } from "next/server";
import { getGuide } from "@/lib/mvp/store";
import { serverError } from "@/lib/mvp/http";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await context.params;
    const guide = await getGuide(sessionId);
    if (!guide) {
      return NextResponse.json({ error: "Guide not found." }, { status: 404 });
    }

    return NextResponse.json(guide);
  } catch (error) {
    return serverError(error);
  }
}
