import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { getEnv } from "@/lib/cf-env";
import { NextRequest, NextResponse } from "next/server";
import { processDocument } from "@/lib/processDocument";
import { saveFileLocally } from "@/lib/saveFileLocally";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const POST = async (request: NextRequest) => {
  try {
    const env = await getEnv();
    const session = await getAuth(env).api.getSession({
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
    const buffer = await file.arrayBuffer();

    // 🚀 SAVING LOCALLY INSTEAD OF BACKBLAZE
    console.log("📂 Saving file locally to public folder...");
    const fileUrl = await saveFileLocally(key, buffer);
    console.log("✅ Saved! Local Path/URL:", fileUrl);

    const db = getDb(env);
    const [doc] = await db
      .insert(documents)
      .values({
        userId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        b2Key: key,
        b2Url: fileUrl,
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

    return NextResponse.json({ documentId: doc.id, url: fileUrl });
  } catch (error) {
    console.error("Local Upload failed:", error);
    return NextResponse.json(
      { error: "Failed to save file locally" },
      { status: 500 },
    );
  }
};
