import { getAuth } from "@/lib/auth";
import { getUploadPresignedUrl } from "@/lib/backblaze";
import { getDb } from "@/lib/db";
import { documents, NewDocument } from "@/lib/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const { env } = await getCloudflareContext({ async: true });
  const session = await getAuth(env).api.getSession({
    headers: request.headers,
  });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { fileName, fileSize } = (await request.json()) as NewDocument;
  if (!fileName || !fileSize) {
    return NextResponse.json(
      { error: "File name and file size are required" },
      { status: 400 },
    );
  }

  const key = `pdfs/${session.user.id}/${Date.now()}-${fileName}`;
  // get presigned url from backblaze
  const presignedUrl = await getUploadPresignedUrl(key, "application/pdf");
  const db = getDb(env);
  const [doc] = await db
    .insert(documents)
    .values({
      userId: session.user.id,
      fileName,
      fileSize,
      b2Key: key,
      b2Url: "",
      status: "uploading",
    })
    .returning();
    console.log("Doc",doc)
  return NextResponse.json({ presignedUrl, documentId: doc.id, key });
};

