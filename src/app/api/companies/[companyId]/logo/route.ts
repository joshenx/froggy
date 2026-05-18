import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { updateCompanyLogo } from "@/lib/mvp/store";
import { isSupabaseAdminConfigured } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function extensionFor(fileName: string, mimeType: string) {
  const match = fileName.match(/\.([a-zA-Z0-9]+)$/);
  if (match) {
    return match[1].toLowerCase();
  }
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/svg+xml") return "svg";
  if (mimeType === "image/webp") return "webp";
  return "bin";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ companyId: string }> },
) {
  try {
    const { companyId } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
    }

    let logoUrl = "";

    if (isSupabaseAdminConfigured()) {
      const supabase = createSupabaseAdminClient();
      const extension = extensionFor(file.name, file.type);
      const path = `${companyId}/${Date.now()}.${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await supabase.storage
        .from("company-logos")
        .upload(path, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from("company-logos").getPublicUrl(path);
      logoUrl = data.publicUrl;
    } else {
      const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
      logoUrl = `data:${file.type || "application/octet-stream"};base64,${base64}`;
    }

    await updateCompanyLogo(companyId, logoUrl);
    return NextResponse.json({ logoUrl }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload the logo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
