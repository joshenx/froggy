import { NextResponse } from "next/server";
import { readMvpStore, updateQuestion } from "@/lib/mvp/store";
import { readJson, serverError } from "@/lib/mvp/http";
import type { Difficulty, RoleLevel, UpdateQuestionInput } from "@/lib/mvp/types";

export const runtime = "nodejs";

const validLevels: RoleLevel[] = ["junior", "mid", "senior", "staff", "manager"];
const validDifficulties: Difficulty[] = [1, 2, 3, 4, 5];

export async function GET(
  _request: Request,
  context: { params: Promise<{ questionId: string }> },
) {
  try {
    const { questionId } = await context.params;
    const store = await readMvpStore();
    const question = store.questions.find((item) => item.id === questionId);

    if (!question) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    return NextResponse.json(question, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ questionId: string }> },
) {
  try {
    const { questionId } = await context.params;
    const body = (await readJson(request)) as Partial<UpdateQuestionInput>;

    if (!body.title?.trim() || !body.prompt?.trim()) {
      return NextResponse.json({ error: "Question title and prompt are required." }, { status: 400 });
    }

    if (!body.difficulty || !validDifficulties.includes(body.difficulty)) {
      return NextResponse.json({ error: "Choose a valid difficulty." }, { status: 400 });
    }

    if (!body.seniority || !validLevels.includes(body.seniority)) {
      return NextResponse.json({ error: "Choose a valid seniority level." }, { status: 400 });
    }

    const axisIds = Array.isArray(body.axisIds)
      ? body.axisIds.map((axisId) => String(axisId).trim()).filter(Boolean)
      : [];
    const companyIds = Array.isArray(body.companyIds)
      ? body.companyIds.map((companyId) => String(companyId).trim()).filter(Boolean)
      : [];
    const levels = Array.isArray(body.levels)
      ? body.levels.map((level) => String(level).trim()).filter(Boolean)
      : [];
    const normalizedLevels = levels.filter((level): level is RoleLevel =>
      validLevels.includes(level as RoleLevel),
    );
    const anchors = Array.isArray(body.anchors)
      ? body.anchors.map((anchor) => String(anchor).trim())
      : [];

    if (axisIds.length === 0) {
      return NextResponse.json({ error: "Select at least one evaluation axis." }, { status: 400 });
    }

    const question = await updateQuestion(questionId, {
      title: body.title,
      prompt: body.prompt,
      difficulty: body.difficulty,
      seniority: body.seniority,
      axisIds,
      companyIds,
      followUps: Array.isArray(body.followUps) ? body.followUps.map(String) : [],
      expectedSignals: Array.isArray(body.expectedSignals) ? body.expectedSignals.map(String) : [],
      expectedDurationMinutes: Number(body.expectedDurationMinutes) || 15,
      collection: body.collection?.trim() || "Engineering",
      roleFamily: body.roleFamily?.trim() || "Engineering",
      levels: normalizedLevels.length ? normalizedLevels : [body.seniority],
      rationale: body.rationale?.trim() || "",
      anchors:
        anchors.length === 3
          ? [anchors[0] || "", anchors[1] || "", anchors[2] || ""]
          : undefined,
    });

    return NextResponse.json({ questionId: question.id }, { status: 200 });
  } catch (error) {
    return serverError(error);
  }
}
