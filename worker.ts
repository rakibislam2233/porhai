// @ts-ignore `.open-next/worker.js` is generated at build time
import openNextWorker from "./.open-next/worker.js";

export { ChatRoomDO } from "./src/durable-objects/chat-room";
export { PorhaiWorkflow } from "./src/workflows/pdf-processor";

const START_PROCESSING_PATH = "/__porhai/process-document";

export default {
  fetch: async (
    request: Request,
    env: CloudflareEnv,
    ctx: ExecutionContext,
  ) => {
    const url = new URL(request.url);

    if (url.pathname === START_PROCESSING_PATH && request.method === "POST") {
      try {
        const { documentId, userId } = (await request.json()) as {
          documentId: string;
          userId: string;
        };

        if (!documentId || !userId) {
          return Response.json(
            { error: "documentId and userId are required" },
            { status: 400 },
          );
        }

        await env.WORKFLOWS.create({
          id: `pdf-processing-${documentId}-${Date.now()}`,
          params: { documentId, userId },
        });

        return Response.json({ ok: true });
      } catch (error) {
        console.error("Failed to start document processing:", error);
        return Response.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Failed to start document processing",
          },
          { status: 500 },
        );
      }
    }

    return openNextWorker.fetch(request, env, ctx);
  },

  async queue(
    batch: MessageBatch<{ type: string; documentId: string; userId: string }>,
    env: CloudflareEnv,
  ) {
    for (const msg of batch.messages) {
      try {
        const { type, documentId, userId } = msg.body;
        if (type === "Process_Document") {
          await env.WORKFLOWS.create({
            id: `pdf-processing-${documentId}-${Date.now()}`,
            params: { documentId, userId },
          });
          msg.ack();
        }
      } catch (error) {
        console.error("Queue processing failed:", error);
        msg.retry();
      }
    }
  },
};
