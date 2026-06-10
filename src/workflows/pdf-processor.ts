import { getDb } from "@/lib/db";
import { chunks, documents } from "@/lib/db/schema";
import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { env } from "process";

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

    // 🛠️ Step 1 Replacement Blueprint (No fs / No path dependency)
    const pdfBufferData = await step.do("fetch-pdf", async () => {
      const doc = await db.query.documents.findFirst({
        where: eq(documents.id, documentId),
      });
      if (!doc) throw new Error("Document not found");
      const targetUrl = doc.b2Url.startsWith("http")
        ? doc.b2Url
        : `${env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL}/${doc.b2Url}`;

      const response = await fetch(targetUrl);
      if (!response.ok)
        throw new Error("Failed to fetch PDF payload from storage network");

      const fileBuffer = await response.arrayBuffer();

      return {
        buffer: Array.from(new Uint8Array(fileBuffer)),
        b2Key: doc.b2Key,
      };
    });

    if (!pdfBufferData) {
      throw new Error("Failed to read local PDF file data");
    }

    // Step 2: Process the PDF (Text Extraction logic fixed)
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
          .join(" ");

        if (!pageText.trim()) continue;

        const words = pageText.split(/\s+/); // Better whitespace split
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
      return allChunks;
    });

    // Step 3: Save the extracted chunks back to the database
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

    // Step 4: Update the document status in the database & KV
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
