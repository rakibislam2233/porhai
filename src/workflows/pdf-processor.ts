import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import {
  WorkflowEntrypoint,
  WorkflowStep,
  WorkflowEvent,
} from "cloudflare:workers";
import { eq } from "drizzle-orm";

type WorkflowParams = {
  documentId: string;
  userId: string;
};

export class PorhaiWorkflow extends WorkflowEntrypoint<
  CloudflareEnv,
  WorkflowParams
> {
  async run(event: WorkflowEvent<WorkflowParams>, step: WorkflowStep) {
    const { documentId } = event.payload;
    const db = getDb(this.env);

    // Step 1: Fetch PDF
    const pdfBufferData = await step.do("fetch-pdf", async () => {
      const doc = await db.query.documents.findFirst({
        where: eq(documents.id, documentId),
      });
      if (!doc) throw new Error("Document not found");
      if (!doc.fileUrl) throw new Error("No file URL found in document record");

      const response = await fetch(doc.fileUrl);
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

    if (!pdfBufferData) throw new Error("Failed to read PDF data");

    // Step 2: Extract chunks (text + annotation links)
    const extractedChunks = await step.do("extract-chunks", async () => {
      const { getDocument } = await import("pdfjs-serverless");
      const uint8 = new Uint8Array(pdfBufferData.buffer);
      const pdf = await getDocument({ data: uint8 }).promise;
      const allChunks: { content: string; pageNumber: number }[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const [textContent, annotations] = await Promise.all([
          page.getTextContent(),
          page.getAnnotations(),
        ]);

        const rawText = textContent.items
          .map((item: any) => item.str)
          .join(" ")
          .replace(/(\S+)\.\s+(\S+)/g, "$1.$2")
          .trim();

        const linkTexts = (annotations as any[])
          .filter((a) => a.subtype === "Link" && a.url)
          .map((a) => `[Link: ${a.url}]`);

        if (linkTexts.length > 0) {
          allChunks.push({
            content: `Page ${pageNum} Links: ${linkTexts.join(", ")}`,
            pageNumber: pageNum,
          });
        }

        if (!rawText) continue;

        const sentences = rawText.match(/[^.!?]+[.!?]+/g) || [rawText];
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
      }

      return allChunks;
    });

    // Step 3: Embed and upsert to Vectorize
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

              return {
                id: `${documentId}-${i + j}`,
                values: embeddingResult.data[0],
                metadata: {
                  documentId,
                  content: chunk.content,
                  pageNumber: chunk.pageNumber,
                },
              };
            } catch (err) {
              console.error("Embedding chunk failed:", err);
              return null;
            }
          }),
        );

        for (const vec of batchVectors) {
          if (vec) vectors.push(vec);
        }
      }

      if (vectors.length > 0) {
        await this.env.VECTORIZE.upsert(vectors);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    });

    // Step 4: Mark as completed
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
