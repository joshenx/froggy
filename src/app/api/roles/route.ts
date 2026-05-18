import { NextResponse } from "next/server";
import { createRoleWithFlow } from "@/lib/mvp/store";
import { readJson, serverError } from "@/lib/mvp/http";
import type { CreateRoleInput, RoleLevel } from "@/lib/mvp/types";

export const runtime = "nodejs";

const allowedLevels: RoleLevel[] = ["junior", "mid", "senior", "staff", "manager"];

export async function POST(request: Request) {
  try {
    const body = (await readJson(request)) as Partial<CreateRoleInput>;
    const stageNames = Array.isArray(body.stageNames)
      ? body.stageNames.map((name) => String(name).trim()).filter(Boolean)
      : [];

    if (!body.name?.trim() || !body.flowName?.trim()) {
      return NextResponse.json(
        { error: "Role name and flow name are required." },
        { status: 400 },
      );
    }

    if (!body.level || !allowedLevels.includes(body.level)) {
      return NextResponse.json({ error: "Select a valid role level." }, { status: 400 });
    }

    if (stageNames.length === 0) {
      return NextResponse.json(
        { error: "Add at least one stage to create a flow." },
        { status: 400 },
      );
    }

    const result = await createRoleWithFlow({
      name: body.name,
      level: body.level,
      flowName: body.flowName,
      stageNames,
    });

    return NextResponse.json({ roleId: result.role.id, flowId: result.flow.id }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
