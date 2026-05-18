import { NextResponse } from "next/server";
import { upsertConnection } from "@/lib/mvp/store";
import { parseProvider, readJson, serverError } from "@/lib/mvp/http";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider: rawProvider } = await context.params;
    const provider = parseProvider(rawProvider);
    const body = (await readJson(request)) as { apiKey?: string };

    if (!body.apiKey?.trim()) {
      return NextResponse.json({ error: "API key is required." }, { status: 400 });
    }

    const connection = await upsertConnection(provider, { apiKey: body.apiKey });
    return NextResponse.json({ connectionId: connection.id, status: connection.status });
  } catch (error) {
    return serverError(error);
  }
}
