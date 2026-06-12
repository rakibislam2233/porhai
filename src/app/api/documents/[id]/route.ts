import { getAuth } from "@/lib/auth";
import { getEnv } from "@/lib/cf-env";
import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { getSupabse } from "@/lib/supabase";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) => {
  try {
    const params = await props.params;
    const documentId = params.id;
    
    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const env = await getEnv();
    const session = await getAuth(env, request.url).api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb(env);
    const doc = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, documentId as any), 
        eq(documents.userId, session.user.id)
      ),
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const supabase = getSupabse(env);
    
    // Attempt to extract the relative path from the fileUrl
    if (doc.fileUrl) {
      const bucketName = env.SUPABASE_BUCKET_NAME;
      const urlParts = doc.fileUrl.split(`${bucketName}/`);
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);
        
        if (storageError) {
          console.error("Supabase storage deletion error:", storageError);
        }
      }
    }

    // 3. Delete from Database (Cascades to chat_sessions and chat_messages)
    await db.delete(documents).where(eq(documents.id, documentId as any));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
};
