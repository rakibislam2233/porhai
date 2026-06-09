import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const { env } = await getCloudflareContext({ async: true });
  const session = await getAuth(env).api.getSession({
    headers: request.headers,
  });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { documentId } = (await request.json()) as { documentId: string };
  if (!documentId) {
    return NextResponse.json(
      { error: "Document ID is required" },
      { status: 400 },
    );
  }
  const db = getDb(env);
  await db
    .update(documents)
    .set({ status: "processing" })
    .where(eq(documents.id, documentId)); // Update the document status to "processing" (or any other appropriate status for documents).

  // Set the status in KV
  await env.KV.put(`doc:status:${documentId}`, "processing", {
    expirationTtl: 3600, // Set an expiration time for the status in KV (e.g., 1 hour).
  });
  await env.QUEUE.send({
    type: "Process_Document",
    documentId,
    userId: session.user.id,
  });
  return NextResponse.json({ message: "Document processing started" });
};
