import { NextResponse } from "next/server";
import type { AtsProvider } from "@/lib/mvp/types";

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new Error("Invalid request body.");
  }
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return NextResponse.json({ error: message }, { status: 400 });
}

export function parseProvider(value: string): AtsProvider {
  if (value === "ashby" || value === "greenhouse") {
    return value;
  }
  throw new Error("Unsupported provider.");
}
