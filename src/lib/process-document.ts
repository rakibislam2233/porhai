type ProcessingEnv = {
  KV?: KVNamespace;
  QUEUE?: Queue;
  WORKFLOWS?: Workflow;
};

export async function startDocumentProcessing(
  env: ProcessingEnv,
  documentId: string,
  userId: string,
) {
  if (process.env.NODE_ENV === "development") {
    console.info(
      "Dev mode: skipping Queue/Workflow processing. Upload saved to storage and database.",
      { documentId },
    );
    return;
  }
  const workflowOptions = {
    id: `pdf-processing-${documentId}-${Date.now()}`,
    params: { documentId, userId },
  };

  const queueMessage = {
    type: "Process_Document" as const,
    documentId,
    userId,
  };

  try {
    await env.KV?.put(`doc:status:${documentId}`, "processing", {
      expirationTtl: 3600,
    });
  } catch (error) {
    console.warn("KV status update skipped:", error);
  }

  if (env.WORKFLOWS?.create) {
    try {
      await env.WORKFLOWS.create(workflowOptions);
      return;
    } catch (error) {
      console.warn("Direct workflow start failed:", error);
    }
  }

  if (env.QUEUE?.send) {
    try {
      await env.QUEUE.send(queueMessage);
      return;
    } catch (error) {
      console.warn("Queue send failed:", error);
    }
  }

  console.warn(
    "Document uploaded but background processing could not be started in this environment.",
    { documentId, userId },
  );
}
