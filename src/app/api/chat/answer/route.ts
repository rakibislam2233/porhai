import { getDb } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  const { env } = await getCloudflareContext({ async: true });
  
  const { question, documentId, history } = await request.json();
  const db = getDb(env);
  const queryEmbedding = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
    text: question,
  });
  const similaryChunks = await db.execute(sql`
    SELECT content, page_number
    FROM chunks
    WHERE document_id = ${documentId}
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding.data[0])}::vector
    LIMIT 5
  `);
  //Context
  const context = similaryChunks.rows.map((c: any) => {
    return `[Page ${c.page_number}]: ${c.content}`.join("\n\n");
  });
  const response = await env.AI.run(
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    {
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Answer questions based ONLY on the provided document context. If the answer is not in the context, say "I'm sorry, but I don't know the answer to that question." Always mention the page number when referencing content. Context: ${context}`,
        },
        {
          ...history,
        },
      ],
    },
  );
  const sources = similarChunks.rows.map((c: any) => c.page_number);
  return NextResponse.json({
    answer: response.response,
    sources: [...new Set(sources)],
  });
};
