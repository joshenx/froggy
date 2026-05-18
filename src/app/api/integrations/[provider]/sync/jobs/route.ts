import { NextResponse } from "next/server";
import { syncProvider } from "@/lib/mvp/store";
import { parseProvider, serverError } from "@/lib/mvp/http";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider: rawProvider } = await context.params;
    const provider = parseProvider(rawProvider);
    const result = await syncProvider(provider);

    return NextResponse.json(result);
  } catch (error) {
    return serverError(error);
  }
}
