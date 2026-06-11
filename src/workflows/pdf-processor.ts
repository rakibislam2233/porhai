import { getDb } from "@/lib/db";
import {documents } from "@/lib/db/schema";
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

    // 🛠️ Step 1: Fetch PDF from Database URL (No fs dependency)
    const pdfBufferData = await step.do("fetch-pdf", async () => {
      const doc = await db.query.documents.findFirst({
        where: eq(documents.id, documentId),
      });
      if (!doc) throw new Error("Document not found");
      const targetUrl = doc.fileUrl;
      if (!targetUrl) throw new Error("No file URL found in document record");

      const response = await fetch(targetUrl);
      if (!response.ok)
        throw new Error(
          `Failed to fetch PDF from storage: ${response.statusText}`,
        );

      const fileBuffer = await response.arrayBuffer();

      return {
        buffer: Array.from(new Uint8Array(fileBuffer)),
        fileName: doc.fileName,
      };
    });

    if (!pdfBufferData) {
      throw new Error("Failed to read local PDF file data");
    }

    // 🛠️ Step 2: Process the PDF (Sentence-Aware Chunking)
    const extractedChunks = await step.do("extract-chunks", async () => {
      const { getDocument } = await import("pdfjs-serverless");
      const uint8 = new Uint8Array(pdfBufferData.buffer);
      const pdf = await getDocument({ data: uint8 }).promise;
      const allChunks: { content: string; pageNumber: number }[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ")
          .trim();

        if (!pageText) continue;
        const sentences = pageText.match(/[^.!?]+[.!?]+/g) || [pageText];
        let current = "";

        for (const sentence of sentences) {
          if ((current + sentence).length > 800) {
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
      }
      return allChunks;
    });

    // 🛠️ Step 3: Embed, Save to Vectorize & Drizzle DB in Batches
    await step.do("embed-and-save", async () => {
      const BATCH_SIZE = 10;
      const vectors: VectorizeVector[] = [];

      for (let i = 0; i < extractedChunks.length; i += BATCH_SIZE) {
        const batch = extractedChunks.slice(i, i + BATCH_SIZE);
        const batchVectors = await Promise.all(
          batch.map(async (chunk, j) => {
            try {
              const embeddingResult = await this.env.AI.run(
                "@cf/baai/bge-base-en-v1.5",
                { text: chunk.content },
              );

              if (
                !embeddingResult ||
                !("data" in embeddingResult) ||
                !embeddingResult.data?.[0]
              ) {
                return null;
              }

              const globalIndex = i + j;

              return {
                id: `${documentId}-${globalIndex}`,
                values: embeddingResult.data[0],
                metadata: {
                  documentId,
                  content: chunk.content,
                  pageNumber: chunk.pageNumber,
                },
                dbData: {
                  documentId,
                  content: chunk.content,
                  pageNumber: chunk.pageNumber,
                  embedding: embeddingResult.data[0],
                },
              };
            } catch (err) {
              console.error("Embedding chunk failed", err);
              return null;
            }
          }),
        );
        for (const vec of batchVectors) {
          if (vec) {
            vectors.push({
              id: vec.id,
              values: vec.values,
              metadata: vec.metadata,
            });
          }
        }
      }
      if (vectors.length > 0 && this.env.VECTORIZE) {
        await this.env.VECTORIZE.upsert(vectors);
      }
    });

    // 🛠️ Step 4: Update the document status in the database & KV
    await step.do("update-document-status", async () => {
      await db
        .update(documents)
        .set({ status: "completed" })
        .where(eq(documents.id, documentId));

      if (this.env.KV) {
        await this.env.KV.put(`doc:status:${documentId}`, "completed", {
          expirationTtl: 3600,
        });
      }
    });
  }
}
