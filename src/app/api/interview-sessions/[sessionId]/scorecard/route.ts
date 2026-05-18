import { NextResponse } from "next/server";
import { submitScorecard } from "@/lib/mvp/store";
import { readJson, serverError } from "@/lib/mvp/http";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await context.params;
    const body = (await readJson(request)) as {
      recommendation?: string;
      confidence?: number;
      overallNotes?: string;
      axisScores?: Array<{ axisId: string; score: number; evidence: string }>;
      questionNotes?: Array<{ questionId: string; notes: string }>;
    };

    if (!body.recommendation || !body.confidence || !body.overallNotes?.trim()) {
      return NextResponse.json(
        { error: "Recommendation, confidence, and summary notes are required." },
        { status: 400 },
      );
    }

    const axisScores = Array.isArray(body.axisScores) ? body.axisScores : [];
    if (axisScores.length === 0) {
      return NextResponse.json({ error: "Add at least one axis score." }, { status: 400 });
    }

    const result = await submitScorecard(sessionId, {
      recommendation: body.recommendation as
        | "strong_no"
        | "no"
        | "lean_no"
        | "lean_yes"
        | "yes"
        | "strong_yes",
      confidence: body.confidence as 1 | 2 | 3 | 4 | 5,
      overallNotes: body.overallNotes,
      axisScores: axisScores.map((score) => ({
        axisId: String(score.axisId),
        score: Number(score.score) as 1 | 2 | 3 | 4 | 5,
        evidence: String(score.evidence ?? ""),
      })),
      questionNotes: Array.isArray(body.questionNotes)
        ? body.questionNotes.map((note) => ({
            questionId: String(note.questionId),
            notes: String(note.notes ?? ""),
          }))
        : [],
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
