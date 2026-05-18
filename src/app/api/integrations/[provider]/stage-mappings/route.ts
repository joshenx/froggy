import { NextResponse } from "next/server";
import { saveStageMapping } from "@/lib/mvp/store";
import { parseProvider, readJson, serverError } from "@/lib/mvp/http";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider: rawProvider } = await context.params;
    const provider = parseProvider(rawProvider);
    const body = (await readJson(request)) as {
      atsJobMappingId?: string;
      externalStageId?: string;
      froggyStageId?: string;
    };

    if (!body.atsJobMappingId || !body.externalStageId || !body.froggyStageId) {
      return NextResponse.json(
        { error: "Job mapping, external stage, and Froggy stage are required." },
        { status: 400 },
      );
    }

    const mapping = await saveStageMapping(provider, {
      atsJobMappingId: body.atsJobMappingId,
      externalStageId: body.externalStageId,
      froggyStageId: body.froggyStageId,
    });

    return NextResponse.json({ mappingId: mapping.id }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
