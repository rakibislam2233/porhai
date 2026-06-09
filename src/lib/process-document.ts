type ProcessingEnv = {
  KV: KVNamespace;
  QUEUE: Queue;
  WORKFLOWS: Workflow;
};

export async function startDocumentProcessing(
  env: ProcessingEnv,
  documentId: string,
  userId: string,
) {
  try {
    await env.KV.put(`doc:status:${documentId}`, "processing", {
      expirationTtl: 3600,
    });
  } catch (error) {
    console.warn("KV status update skipped:", error);
  }

  const message = {
    type: "Process_Document" as const,
    documentId,
    userId,
  };

  try {
    await env.QUEUE.send(message);
    return;
  } catch (error) {
    console.warn("Queue send failed, falling back to workflow:", error);
  }

  await env.WORKFLOWS.create({
    id: `pdf-processing-${documentId}-${Date.now()}`,
    params: { documentId, userId },
  });
}
