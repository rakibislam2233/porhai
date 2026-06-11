import { getAuth } from "@/lib/auth";
import { getEnv } from "@/lib/cf-env";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { processDocument } from "@/lib/processDocument";
import { getSupabse } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const POST = async (request: NextRequest) => {
  try {
    const env = await getEnv();
    const session = await getAuth(env, request.url).api.getSession({
      headers: request.headers,
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 },
      );
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 50MB" },
        { status: 400 },
      );
    }

    // Relative Key dynamic tracking
    const key = `pdfs/${session.user.id}/${Date.now()}-${file.name}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const supabase = getSupabse(env);

    const { data, error } = await supabase.storage
      .from(env.SUPABASE_BUCKET_NAME)
      .upload(key, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from(env.SUPABASE_BUCKET_NAME).getPublicUrl(data.path);

    const db = getDb(env);
    const [doc] = await db
      .insert(documents)
      .values({
        userId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        fileUrl: publicUrl,
        status: "processing",
      })
      .returning();

    if (process.env.NODE_ENV === "development") {
      await processDocument(env, doc.id);
    } else {
      if (env.KV)
        await env.KV.put(`doc:status:${doc.id}`, "processing", {
          expirationTtl: 3600,
        });
      if (env.QUEUE) {
        await env.QUEUE.send({
          type: "Process_Document",
          documentId: doc.id,
          userId: session.user.id,
        });
      }
    }
    return NextResponse.json({ documentId: doc.id, url: publicUrl });
  } catch (error) {
    console.error("File Upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
};
