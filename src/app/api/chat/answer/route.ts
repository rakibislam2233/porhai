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

    // Step 2
    console.log("Querying with documentId:", documentId);
    console.log("My Question", question);

    const results = await env.VECTORIZE.query(queryEmbedding.data[0], {
      topK: 10,
      filter: {
        documentId: { $eq: documentId },
      },
      returnValues: false,
      returnMetadata: "all",
    });

    console.log("Vector Result", results);

    // Step 3: Filter by similarity score and build context
    const relevantMatches = results.matches.filter((m) => (m.score ?? 0) > 0.2);
    const context = relevantMatches
      .map((m) => `[Page ${m.metadata?.pageNumber}]: ${m.metadata?.content}`)
      .join("\n\n");

    const finalContext =
      context.trim() ||
      results.matches
        .map((m) => `[Page ${m.metadata?.pageNumber}]: ${m.metadata?.content}`)
        .join("\n\n");

    // Step 4: Stream AI response
    const aiResponse = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      {
        messages: [
          {
            role: "system",
            content: `You are a strict document Q&A assistant.

CRITICAL RULES:
- Answer ONLY using the exact information from the document context below
- Do NOT add, infer, or assume any information not present in the context
- Do NOT generate information from your training data
- If information is not in the context, say: "এই তথ্য document-এ নেই"
- Be concise, avoid repetition
- Never leave a sentence incomplete
- Mention page numbers when referencing content

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

Document Context (use ONLY this):
${finalContext}`,
          },
          ...history.slice(-6),
          { role: "user", content: question },
        ],
        stream: true,
        max_tokens: 2048,
      },
    );

    // Step 5: Stream + save to DB on flush
    let fullAnswer = "";
    let buffer = "";
    const decoder = new TextDecoder();

    const transform = new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
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
        // Remaining buffer process and save
        const remaining = buffer + decoder.decode();
        if (remaining.startsWith("data: ")) {
          const json = remaining.slice(6).trim();
          if (json && json !== "[DONE]") {
            try {
              const parsed = JSON.parse(json);
              if (parsed.response) fullAnswer += parsed.response;
            } catch {}
          }
        }

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

    (aiResponse as unknown as ReadableStream).pipeTo(transform.writable);

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
