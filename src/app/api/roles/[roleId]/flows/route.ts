import { NextResponse } from "next/server";
import { addStage, saveFlowLayout } from "@/lib/mvp/store";
import { readJson, serverError } from "@/lib/mvp/http";
import type { AddStageInput, UpdateFlowLayoutInput } from "@/lib/mvp/types";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ roleId: string }> },
) {
  try {
    const { roleId } = await context.params;
    const body = (await readJson(request)) as Partial<AddStageInput>;
    const scoringRules = Array.isArray(body.scoringRules)
      ? body.scoringRules.map((rule) => String(rule).trim()).filter(Boolean)
      : [];

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Stage name is required." }, { status: 400 });
    }

    if (!body.durationMinutes || body.durationMinutes <= 0) {
      return NextResponse.json({ error: "Enter a valid stage duration." }, { status: 400 });
    }

    const stage = await addStage(roleId, {
      name: body.name,
      description: body.description,
      durationMinutes: body.durationMinutes,
      interviewerRole: body.interviewerRole,
      scoringRules,
    });

    return NextResponse.json({ stageId: stage.id }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ roleId: string }> },
) {
  try {
    const { roleId } = await context.params;
    const body = (await readJson(request)) as Partial<UpdateFlowLayoutInput>;
    const stages = Array.isArray(body.stages) ? body.stages : [];
    const targetAxisIds = Array.isArray(body.targetAxisIds)
      ? body.targetAxisIds.map((axisId) => String(axisId).trim()).filter(Boolean)
      : undefined;

    if (stages.length === 0) {
      return NextResponse.json({ error: "Add at least one stage to save the flow." }, { status: 400 });
    }

    if (body.flowName !== undefined && !String(body.flowName).trim()) {
      return NextResponse.json({ error: "Flow name is required." }, { status: 400 });
    }

    if (
      body.status !== undefined &&
      body.status !== "draft" &&
      body.status !== "active" &&
      body.status !== "archived"
    ) {
      return NextResponse.json({ error: "Choose a valid flow status." }, { status: 400 });
    }

    const invalidStage = stages.find(
      (stage) =>
        !stage.name?.trim() ||
        !Number.isFinite(Number(stage.durationMinutes)) ||
        Number(stage.durationMinutes) <= 0,
    );

    if (invalidStage) {
      return NextResponse.json({ error: "Every stage needs a name and duration." }, { status: 400 });
    }

    const result = await saveFlowLayout(roleId, {
      flowName: body.flowName ? String(body.flowName) : undefined,
      status: body.status,
      targetAxisIds,
      stages: stages.map((stage) => ({
        id: stage.id ? String(stage.id) : undefined,
        name: String(stage.name),
        description: stage.description ? String(stage.description) : undefined,
        durationMinutes: Number(stage.durationMinutes),
        interviewerRole: stage.interviewerRole ? String(stage.interviewerRole) : undefined,
        scoringRules: Array.isArray(stage.scoringRules)
          ? stage.scoringRules.map((rule) => String(rule))
          : [],
        questionIds: Array.isArray(stage.questionIds)
          ? stage.questionIds.map((questionId) => String(questionId))
          : [],
        canvasX: Number(stage.canvasX) || 0,
        canvasY: Number(stage.canvasY) || 0,
        orderIndex: Number(stage.orderIndex) || 1,
      })),
    });

    return NextResponse.json(result);
  } catch (error) {
    return serverError(error);
  }
}
