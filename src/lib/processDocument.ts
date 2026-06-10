import { getDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { chunks, documents } from "./db/schema";
import { getReadPresignedUrl } from "./backblaze";

const { getDocument: getPdfDocument } = await import("pdfjs-serverless");

export async function processDocument(env: CloudflareEnv, documentId: string) {
  console.log(
    "============================ Starting to process document =============================",
  );
  const db = getDb(env);
  try {
    // Step 1: Fetch PDF from Backblaze
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, documentId),
    });

    if (!doc) throw new Error("Document not found");

    const url = await getReadPresignedUrl(doc.b2Key, env);
    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to fetch PDF from Backblaze");

    const buffer = await response.arrayBuffer();
    const uint8 = new Uint8Array(buffer);

    // Step 2: Extract chunks
    const pdf = await getPdfDocument({ data: uint8 }).promise;
    const allChunks: { content: string; pageNumber: number }[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");

      if (!pageText.trim()) continue;

      const words = pageText.split(" ");
      let chunk = "";

      for (const word of words) {
        chunk += word + " ";
        if (chunk.length > 1000) {
          allChunks.push({ content: chunk.trim(), pageNumber: pageNum });
          chunk = "";
        }
      }

      if (chunk.trim()) {
        allChunks.push({ content: chunk.trim(), pageNumber: pageNum });
      }
    }

    console.log(`Extracted ${allChunks.length} chunks from PDF`);

    // Step 3: Embed and save
    for (const chunk of allChunks) {
      const embeddingResult = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
        text: chunk.content,
      });

      if (!("data" in embeddingResult) || !embeddingResult.data?.[0]) {
        throw new Error("Failed to generate embedding");
      }

      await db.insert(chunks).values({
        documentId,
        content: chunk.content,
        pageNumber: chunk.pageNumber,
        embedding: embeddingResult.data[0],
      });
    }

    // Step 4: Update status to completed
    await db
      .update(documents)
      .set({ status: "completed" })
      .where(eq(documents.id, documentId));

    console.log(`Document ${documentId} processed successfully`);
  } catch (error) {
    console.error(`Document processing failed for ${documentId}:`, error);
    await db
      .update(documents)
      .set({ status: "failed" })
      .where(eq(documents.id, documentId));
    throw error;
  }
}
