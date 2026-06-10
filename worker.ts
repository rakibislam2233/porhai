// @ts-ignore
import openNextWorker from "./.open-next/worker.js";
export { ChatRoomDO } from "./src/durable-objects/chat-room"; 
export { PorhaiWorkflow } from "./src/workflows/pdf-processor";

export default {
  fetch: async (
    request: Request,
    env: CloudflareEnv,
    ctx: ExecutionContext,
  ) => {
    return openNextWorker.fetch(request, env, ctx);
  },

  async queue(
    batch: MessageBatch<{ type: string; documentId: string; userId: string }>,
    env: CloudflareEnv,
    ctx: ExecutionContext,
  ) {
    for (const msg of batch.messages) {
      try {
        const { type, documentId, userId } = msg.body;

        if (type === "Process_Document") {
          // 🚀 Cloudflare Workflows Trigger Rule (using .create with strict naming options)
          await env.WORKFLOWS.create({
            id: `pdf-processing-${documentId}-${Date.now()}`,
            params: { documentId, userId },
          });
          msg.ack();
        }
      } catch (error) {
        console.error("🔴 Queue processing failed:", error);
        msg.retry();
      }
    }
  },
};
