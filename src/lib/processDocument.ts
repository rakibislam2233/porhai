import { getDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { documents } from "./db/schema";
import { waitForVectorizeIndex } from "./waitForVectorizeIndex";
const { getDocument: getPdfDocument } = await import("pdfjs-serverless");

export async function processDocument(env: CloudflareEnv, documentId: string) {
  const db = getDb(env);

  try {
    // Step 1: Document fetch from DB
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    });
    if (!doc) throw new Error("Document not found");

    // Step 2: Direct get public url for doc
    const fileUrl = doc.fileUrl;
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Step 3: Text extract and chunk
    const pdf = await getPdfDocument({ data: uint8Array }).promise;
    const allChunks: { content: string; pageNumber: number }[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const [textContent, annotations] = await Promise.all([
        page.getTextContent(),
        page.getAnnotations(),
      ]);

      // Broken URL fix + raw text
      const rawText = textContent.items
        .map((item: any) => item.str)
        .join(" ")
        .replace(/(\S+)\.\s+(\S+)/g, "$1.$2")
        .trim();

      // Annotation links
      const linkTexts = annotations
        .filter((a: any) => a.subtype === "Link" && a.url)
        .map((a: any) => `[Link: ${a.url}]`);

      if (linkTexts.length > 0) {
        allChunks.push({
          content: `Page ${pageNum} Links: ${linkTexts.join(", ")}`,
          pageNumber: pageNum,
        });
      }

      const pageText = rawText;
      if (!pageText) continue;
      const sentences = pageText.match(/[^.!?]+[.!?]+/g) || [pageText];
      let current = "";

      for (const sentence of sentences) {
        if ((current + sentence).length > 1200) {
          if (current.trim()) {
            allChunks.push({ content: current.trim(), pageNumber: pageNum });
          }
          current = sentence;
        } else {
          current += " " + sentence;
        }
      }
      if (current.trim()) {
        allChunks.push({ content: current.trim(), pageNumber: pageNum });
      }
      console.log(`\n========== PAGE ${pageNum} ==========`);
      console.log("RAW TEXT:", rawText);
      console.log("LINKS:", linkTexts);
    }

    // Embed and upsert
    const BATCH_SIZE = 10;
    const vectors: VectorizeVector[] = [];

    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
      const batch = allChunks.slice(i, i + BATCH_SIZE);
      const batchVectors = await Promise.all(
        batch.map(async (chunk, j) => {
          const result = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
            text: chunk.content,
          });
          if (!result || !("data" in result) || !result.data?.[0]) return null;

          return {
            id: `${documentId}-${i + j}`,
            values: result.data[0],
            metadata: {
              documentId,
              content: chunk.content,
              pageNumber: chunk.pageNumber,
            },
          };
        }),
      );

      for (const vec of batchVectors) {
        if (vec) vectors.push(vec);
      }
    }

    if (vectors.length > 0) {
      await env.VECTORIZE.upsert(vectors);
    }
    console.log(
      `Document ${documentId} processed — ${vectors.length} vectors stored`,
    );
    await waitForVectorizeIndex(env, documentId, Array.from(vectors[0].values));
    // Step 5: Mark as completed
    await db
      .update(documents)
      .set({ status: "completed" })
      .where(eq(documents.id, documentId));
  } catch (error) {
    console.error(`Processing failed for ${documentId}:`, error);
    await db
      .update(documents)
      .set({ status: "failed" })
      .where(eq(documents.id, documentId));
    throw error;
  }
}
