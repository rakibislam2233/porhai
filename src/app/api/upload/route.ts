import { getAuth } from "@/lib/auth";
import { uploadFileToBackblaze } from "@/lib/backblaze";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { getEnv } from "@/lib/cf-env";
import { NextRequest, NextResponse } from "next/server";
import { processDocument } from "@/lib/processDocument";

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

    const key = `pdfs/${session.user.id}/${Date.now()}-${file.name}`;
    const buffer = await file.arrayBuffer();

    await uploadFileToBackblaze(key, buffer, "application/pdf", env);

    const db = getDb(env);
    const [doc] = await db
      .insert(documents)
      .values({
        userId: session.user.id,
        fileName: file.name,
        fileSize: file.size,
        b2Key: key,
        b2Url: "",
        status: "processing",
      })
      .returning();
    // In development, we can process the document immediately for faster feedback
    if (process.env.NODE_ENV === "development") {
      await processDocument(env, doc.id);
    } else {
      // Mark the document as processing in KV so that the frontend can show the correct status
      await env.KV?.put(`doc:status:${doc.id}`, "processing", {
        expirationTtl: 3600,
      });

      // Enqueue a message to process the document asynchronously
      await env.QUEUE.send({
        type: "Process_Document",
        documentId: doc.id,
        userId: session.user.id,
      });
    }

    return NextResponse.json({ documentId: doc.id });
  } catch (error) {
    console.error("Upload failed:", error);

    let message = "Failed to upload document";
    if (error instanceof Error) {
      message = error.message;
      if (error.message.includes("Backblaze credentials")) {
        message = "Storage is not configured on the server";
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
};
