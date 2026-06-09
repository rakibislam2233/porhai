import { getReadPresignedUrl } from "@/lib/backblaze";
import { getDb } from "@/lib/db";
import { chunks, documents } from "@/lib/db/schema";
import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from "cloudflare:workers";
import { eq } from "drizzle-orm";

export class PorhaiWorkflow extends WorkflowEntrypoint<
  CloudflareEnv,
  { documentId: string; userId: string }
> {
  async run(
    event: WorkflowEvent<{ documentId: string; userId: string }>,
    step: WorkflowStep,
  ) {
    const { documentId } = event.payload;
    const db = getDb(this.env);

    // Step 1: Fetch the document details Backblaze
    const pdfBuffer = await step.do("fetch-pdf", async () => {
      const doc = await db.query.documents.findFirst({
        where: eq(documents.id, documentId),
      });
      if (!doc) {
        throw new Error("Document not found");
      }
      //Backblaze to presigned url and fetch the PDF as buffer
      const url = await getReadPresignedUrl(doc.b2Key, this.env);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch PDF from Backblaze");
      }
      const buffer = await response.arrayBuffer();
      return {
        buffer: Array.from(new Uint8Array(buffer)),
        b2Key: doc.b2Key,
      };
      return;
    });

    if (!pdfBuffer) {
      throw new Error("Failed to fetch PDF from Backblaze");
    }

    //Step 2: Process the PDF (e.g., extract text, generate embeddings, etc.)
    const extractedChunks = await step.do("extract-chunks", async () => {
      const { getDocument } = await import("pdfjs-serverless");
      const uint8 = new Uint8Array(pdfBuffer.buffer);
      const pdf = await getDocument({ data: uint8 }).promise;
      const allChunks: { content: string; pageNumber: number }[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        if (!pageText) continue;

        const words = pageText.split(" ");
        let chunk = "";
        for (const word of words) {
          chunk += word + " ";
          if (chunk.length > 1000) {
            allChunks.push({ content: chunk, pageNumber: pageNum });
            chunk = "";
          }
          if (chunk.trim()) {
            allChunks.push({ content: chunk, pageNumber: pageNum });
          }
        }
      }
      return allChunks;
    });

    //Step 3: Save the extracted chunks back to the database
    await step.do("embed-and-save", async () => {
      for (const chunk of extractedChunks) {
        const embeddingResult = await this.env.AI.run(
          "@cf/baai/bge-base-en-v1.5",
          {
            text: chunk.content,
          },
        );
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
    });

    //Step 4: Update the document status in the database
    await step.do("update-document-status", async () => {
      await db
        .update(documents)
        .set({ status: "completed" })
        .where(eq(documents.id, documentId));
    });

    await this.env.KV.put(`doc:status:${documentId}`, "completed", {
      expirationTtl: 3600,
    });
  }
}
