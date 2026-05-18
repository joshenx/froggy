import { NextResponse } from "next/server";
import { saveJobMapping } from "@/lib/mvp/store";
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
      externalJobId?: string;
      froggyRoleId?: string;
      froggyFlowId?: string;
    };

    if (!body.externalJobId || !body.froggyRoleId || !body.froggyFlowId) {
      return NextResponse.json({ error: "External job, role, and flow are required." }, { status: 400 });
    }

    const mapping = await saveJobMapping(provider, {
      externalJobId: body.externalJobId,
      froggyRoleId: body.froggyRoleId,
      froggyFlowId: body.froggyFlowId,
    });

    return NextResponse.json({ mappingId: mapping.id }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
