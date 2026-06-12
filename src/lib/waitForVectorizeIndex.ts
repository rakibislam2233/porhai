export async function waitForVectorizeIndex(
  env: CloudflareEnv,
  documentId: string,
  sampleEmbedding: number[],
  maxAttempts = 10,
  delayMs = 3000,
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const test = await env.VECTORIZE.query(sampleEmbedding, {
      topK: 1,
      filter: { documentId: { $eq: documentId } },
      returnMetadata: "none",
    });

    if (test.matches.length > 0) {
      console.log(`Vectorize ready after ${attempt + 1} attempt(s)`);
      return;
    }

    console.log(
      `Vectorize not ready yet, attempt ${attempt + 1}/${maxAttempts}`,
    );
    await new Promise((res) => setTimeout(res, delayMs));
  }
  console.warn(
    "Vectorize index may not be fully ready, marking completed anyway",
  );
}