import { NextResponse } from "next/server";
import { createCompany } from "@/lib/mvp/store";
import { readJson, serverError } from "@/lib/mvp/http";
import type { CreateCompanyInput } from "@/lib/mvp/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await readJson(request)) as Partial<CreateCompanyInput>;

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    }

    const company = await createCompany({
      name: body.name,
      website: body.website,
      logoUrl: body.logoUrl,
    });

    return NextResponse.json({ companyId: company.id }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
