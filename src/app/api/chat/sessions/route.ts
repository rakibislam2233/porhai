import { getAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/cf-env";
import { chatSessions, chatMessages } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
export const GET = async (request: NextRequest) => {
  try {
    const env = await getEnv();
    const session = await getAuth(env).api.getSession({
      headers: request.headers,
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const documentId = request.nextUrl.searchParams.get("documentId");
    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 },
      );
    }

    const db = getDb(env);
    const existingSession = await db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.userId, session.user.id),
        eq(chatSessions.documentId, documentId),
      ),
      with: {
        messages: {
          orderBy: asc(chatMessages.createdAt),
        },
      },
    });

    return NextResponse.json({ session: existingSession ?? null });
  } catch (error) {
    console.error("Failed to fetch chat session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 },
    );
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const env = await getEnv();
    const session = await getAuth(env).api.getSession({
      headers: request.headers,
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { documentId } = (await request.json()) as { documentId: string };
    if (!documentId) {
      return NextResponse.json(
        { error: "documentId is required" },
        { status: 400 },
      );
    }

    const db = getDb(env);
    const existing = await db.query.chatSessions.findFirst({
      where: and(
        eq(chatSessions.userId, session.user.id),
        eq(chatSessions.documentId, documentId),
      ),
    });

    if (existing) {
      return NextResponse.json({ session: existing });
    }

    const [newSession] = await db
      .insert(chatSessions)
      .values({
        userId: session.user.id,
        documentId,
      })
      .returning();
    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error("Failed to create chat session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
};
