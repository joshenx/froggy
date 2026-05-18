import { NextResponse } from "next/server";
import { getPacket } from "@/lib/mvp/store";
import { serverError } from "@/lib/mvp/http";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ applicationId: string }> },
) {
  try {
    const { applicationId } = await context.params;
    const packet = await getPacket(applicationId);
    if (!packet) {
      return NextResponse.json({ error: "Packet not found." }, { status: 404 });
    }

    return NextResponse.json(packet);
  } catch (error) {
    return serverError(error);
  }
}
