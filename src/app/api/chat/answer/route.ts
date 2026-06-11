import { getAuth } from "@/lib/auth";
import { getEnv } from "@/lib/cf-env";
import { getDb } from "@/lib/db";
import { chatMessages } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

type ChatAnswerRequest = {
  question: string;
  documentId: string;
  sessionId: string;
  history: { role: string; content: string }[];
};

export const POST = async (request: NextRequest) => {
  try {
    const env = await getEnv();
    const session = await getAuth(env, request.url).api.getSession({
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

    // Step 1: Embed the question
    const queryEmbedding = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: question,
    });

    if (!("data" in queryEmbedding) || !queryEmbedding.data?.[0]) {
      return NextResponse.json({ error: "Embedding failed" }, { status: 500 });
    }

    console.log("Query Embedding", queryEmbedding.data[0]);
    console.log("Document ID", documentId);

    // Step 2: Query Vectorize
    const results = await env.VECTORIZE.query(queryEmbedding.data[0], {
      topK: 5,
      filter: { id: "7abe751e-c6eb-45cd-8449-619347d2d5a7" },
      returnMetadata: "all",
    });

    console.log("Vector Search", results);

    // Step 3: Filter by similarity score and build context
    const relevantMatches = results.matches.filter(
      (m) => (m.score ?? 0) > 0.55,
    );

    const context = relevantMatches
      .map((m) => `[Page ${m.metadata?.pageNumber}]: ${m.metadata?.content}`)
      .join("\n\n");

    // Step 4: Stream AI response
    const aiResponse = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      {
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant for document Q&A.

LANGUAGE RULE:
- Bengali script → reply in Bengali
- Banglish → reply in Banglish
- English → reply in English

FORMATTING RULES:
- Use **bold** for important terms
- Use bullet lists for multiple points
- Use numbered lists for steps
- Use ### for section headings
- Use markdown tables for comparisons
- Add blank line between paragraphs

ANSWER RULES:
- Answer ONLY from the document context below
- Mention page numbers when referencing content
- If answer not in context, say so clearly

Document Context:
${context}`,
          },
          ...history.slice(-6),
          { role: "user", content: question },
        ],
        stream: true,
      },
    );

    // Step 5: Stream + save to DB on flush
    let fullAnswer = "";

    const transform = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            if (parsed.response) fullAnswer += parsed.response;
          } catch {}
        }
        controller.enqueue(chunk);
      },
      async flush() {
        if (!fullAnswer) return;
        try {
          const db = getDb(env);
          await db.insert(chatMessages).values([
            { sessionId, role: "user", content: question },
            { sessionId, role: "assistant", content: fullAnswer },
          ]);
        } catch (err) {
          console.error("DB save failed:", err);
        }
      },
    });

    (aiResponse as ReadableStream).pipeTo(transform.writable);

    return new Response(transform.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat answer failed:", error);
    return NextResponse.json(
      { error: "Failed to generate answer" },
      { status: 500 },
    );
  }
};
