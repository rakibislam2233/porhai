type ProcessingEnv = {
  KV: KVNamespace;
  QUEUE?: Queue;
  WORKFLOWS?: Workflow;
  WORKER_SELF_REFERENCE?: Fetcher;
};

const START_PROCESSING_PATH = "/__porhai/process-document";

async function startWorkflowDirectly(
  env: ProcessingEnv,
  documentId: string,
  userId: string,
) {
  const options = {
    id: `pdf-processing-${documentId}-${Date.now()}`,
    params: { documentId, userId },
  };

  if (env.WORKFLOWS?.create) {
    await env.WORKFLOWS.create(options);
    return;
  }

  if (env.WORKER_SELF_REFERENCE) {
    const response = await env.WORKER_SELF_REFERENCE.fetch(
      `https://internal${START_PROCESSING_PATH}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, userId }),
      },
    );

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error || "Failed to start document processing");
    }

    return;
  }

  throw new Error("Document processing is unavailable in this environment");
}

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

  if (env.QUEUE?.send) {
    try {
      await env.QUEUE.send(message);
      return;
    } catch (error) {
      console.warn("Queue send failed, using direct workflow trigger:", error);
    }
  }

  await startWorkflowDirectly(env, documentId, userId);
}

export { START_PROCESSING_PATH };
