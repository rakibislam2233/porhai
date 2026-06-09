import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cf-env";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getReadPresignedUrl } from "@/lib/backblaze";
import { getAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const env = await getEnv();
  const session = await getAuth(env).api.getSession({
    headers: req.headers,
  });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb(env);

  const docs = await db.query.documents.findMany({
    where: eq(documents.userId, session.user.id),
    orderBy: desc(documents.createdAt),
  });

  const docsWithUrls = await Promise.all(
    docs.map(async (doc) => {
      const b2Url = doc.b2Key ? await getReadPresignedUrl(doc.b2Key, env) : null;
      const sizeInMB = doc.fileSize
        ? doc.fileSize > 1024 * 1024
          ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
          : `${(doc.fileSize / 1024).toFixed(0)} KB`
        : "Unknown";

      return {
        id: doc.id,
        name: doc.fileName,
        size: sizeInMB,
        uploadedAt: doc.createdAt,
        pageCount: doc.pageCount,
        status: doc.status,
        b2Url,
      };
    }),
  );

  return NextResponse.json({ documents: docsWithUrls });
}
