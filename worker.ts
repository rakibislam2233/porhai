// @ts-ignore 
import worker from "./.open-next/worker.js";
export { ChatRoomDO } from "./src/durable-objects/chat-room";
export { PorhaiWorkflow } from "./src/workflows/pdf-processor";

export default {
  fetch: worker.fetch,
  async queue(batch: MessageBatch<any>, env: CloudflareEnv) {
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
        console.error("❌ Queue processing failed:", error);
        msg.retry();
      }
    }
  },
};
