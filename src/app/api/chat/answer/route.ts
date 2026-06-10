import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/cf-env";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type ChatAnswerRequest = {
  question: string;
  documentId: string;
  history: { role: string; content: string }[];
};

type ChunkRow = {
  content: string;
  page_number: number;
};

export const POST = async (request: NextRequest) => {
  const env = await getEnv();

  const { question, documentId, history } =
    (await request.json()) as ChatAnswerRequest;
  const db = getDb(env);
  const queryEmbedding = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
    text: question,
  });
  if (!("data" in queryEmbedding) || !queryEmbedding.data?.[0]) {
    return NextResponse.json(
      { error: "Failed to generate embedding" },
      { status: 500 },
    );
  }
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
  const response = await env.AI.run(
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    {
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant for document Q&A.
          CRITICAL LANGUAGE RULE:
          - Detect the language of the user's question
          - If the question is in Bengali (Bangla script like আমি, কী, কেন), reply in Bengali
          - If the question is in Banglish (Bengali written in English letters like "ki ache", "keno holo"), reply in Banglish
          - If the question is in English, reply in English
          - Always match the user's language exactly. Never switch languages.

          Answer questions based ONLY on the provided document context.
          If the answer is not in the context, say so in the same language as the question.
          Always mention page numbers when referencing content.
          Context: ${context}`,
        },
        ...history,
      ],
    },
  );
  const sources = chunkRows.map((c) => c.page_number);
  const answer =
    typeof response === "string"
      ? response
      : "response" in response
        ? response.response
        : "";
  return NextResponse.json({
    answer,
    sources: [...new Set(sources)],
  });
};
