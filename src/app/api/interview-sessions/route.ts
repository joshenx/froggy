import { NextResponse } from "next/server";
import { createInterviewSession } from "@/lib/mvp/store";
import { readJson, serverError } from "@/lib/mvp/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await readJson(request)) as {
      applicationId?: string;
      froggyStageId?: string;
      interviewerUserId?: string;
      scheduledAt?: string;
      externalInterviewId?: string;
    };

    if (!body.applicationId || !body.froggyStageId) {
      return NextResponse.json(
        { error: "Application and Froggy stage are required." },
        { status: 400 },
      );
    }

    const session = await createInterviewSession({
      applicationId: body.applicationId,
      froggyStageId: body.froggyStageId,
      interviewerUserId: body.interviewerUserId,
      scheduledAt: body.scheduledAt,
      externalInterviewId: body.externalInterviewId,
    });

    return NextResponse.json({ sessionId: session.id }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
