import { getDb } from "@/lib/db";
import { getAuth } from "@/lib/auth";
import { getEnv } from "@/lib/cf-env";
import { chatMessages } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type ChatAnswerRequest = {
  question: string;
  documentId: string;
  sessionId: string;
  history: { role: string; content: string }[];
};

type ChunkRow = {
  content: string;
  page_number: number;
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

    const { question, documentId, sessionId, history } =
      (await request.json()) as ChatAnswerRequest;

    if (!question || !documentId || !sessionId) {
      return NextResponse.json(
        { error: "question, documentId and sessionId are required" },
        { status: 400 },
      );
    }

    const db = getDb(env);

    // Step 1: Question emabedding 
    const queryEmbedding = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: question,
    });

    if (!("data" in queryEmbedding) || !queryEmbedding.data?.[0]) {
      return NextResponse.json(
        { error: "Failed to generate embedding" },
        { status: 500 },
      );
    }

    // Step 2: Vector similarity find top 5 relevant chunks
    const similarChunks = await db.execute(sql`
      SELECT content, page_number
      FROM chunks
      WHERE document_id = ${documentId}
      ORDER BY embedding <=> ${JSON.stringify(queryEmbedding.data[0])}::vector
      LIMIT 5
    `);

    const chunkRows = similarChunks as unknown as ChunkRow[];
    const context = chunkRows
      .map((c) => `[Page ${c.page_number}]: ${c.content}`)
      .join("\n\n");

    // Step 3: AI to generate answer with context + question + history
    const aiResponse = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      {
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant for document Q&A.

CRITICAL LANGUAGE RULE:
- Carefully detect the language/script of the user's latest question
- If the question is in Bengali script (বাংলা), reply entirely in Bengali
- If the question is in Banglish (Bengali words written in English letters, e.g. "ki ache", "keno holo", "ami jante chai"), reply entirely in Banglish
- If the question is in English, reply entirely in English
- Never mix languages. Always match the user's language exactly.

ANSWER RULES:
- Answer based ONLY on the provided document context below
- If the answer is not in the context, say so in the same language as the question
- Always mention page numbers when referencing specific content

Document Context:
${context}`,
          },
          ...history,
          { role: "user", content: question },
        ],
      },
    );

    const answer =
      typeof aiResponse === "string"
        ? aiResponse
        : "response" in aiResponse
          ? (aiResponse.response ?? "")
          : "";

    const sources = [...new Set(chunkRows.map((c) => c.page_number))];

    // Step 4: Message database এ question + answer + sources save 
    await db.insert(chatMessages).values([
      {
        sessionId,
        role: "user",
        content: question,
        sources: null,
      },
      {
        sessionId,
        role: "assistant",
        content: answer,
        sources,
      },
    ]);

    return NextResponse.json({ answer, sources });
  } catch (error) {
    console.error("Chat answer failed:", error);
    return NextResponse.json(
      { error: "Failed to generate answer" },
      { status: 500 },
    );
  }
};
