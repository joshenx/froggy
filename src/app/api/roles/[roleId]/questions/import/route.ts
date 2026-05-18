import { NextResponse } from "next/server";
import { importQuestionsFromCsv } from "@/lib/mvp/store";
import { readJson, serverError } from "@/lib/mvp/http";
import type { ImportQuestionsInput } from "@/lib/mvp/types";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ roleId: string }> },
) {
  try {
    const { roleId } = await context.params;
    const body = (await readJson(request)) as Partial<ImportQuestionsInput>;

    if (!body.csvText?.trim()) {
      return NextResponse.json({ error: "CSV text is required." }, { status: 400 });
    }

    const result = await importQuestionsFromCsv(roleId, body.csvText);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
