import { NextResponse } from "next/server";
import { attachQuestionToStages } from "@/lib/mvp/store";
import { readJson, serverError } from "@/lib/mvp/http";
import type { AttachQuestionToStagesInput } from "@/lib/mvp/types";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ questionId: string }> },
) {
  try {
    const { questionId } = await context.params;
    const body = (await readJson(request)) as Partial<AttachQuestionToStagesInput>;
    const stageIds = Array.isArray(body.stageIds)
      ? body.stageIds.map((stageId) => String(stageId).trim()).filter(Boolean)
      : [];

    if (stageIds.length === 0) {
      return NextResponse.json({ error: "Select at least one stage." }, { status: 400 });
    }

    const result = await attachQuestionToStages(questionId, { stageIds });
    return NextResponse.json(
      { questionId: result.question.id, attachedStageIds: result.attachedStageIds },
      { status: 201 },
    );
  } catch (error) {
    return serverError(error);
  }
}
