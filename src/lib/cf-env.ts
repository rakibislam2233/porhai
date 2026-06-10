import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getEnv(): Promise<CloudflareEnv> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as unknown as CloudflareEnv;
  } catch (error) {
    console.warn(
      "⚠️ Failed to get Cloudflare context, falling back to process.env",
      error,
    );
    return process.env as unknown as CloudflareEnv;
  }
}

export function isDevRuntime() {
  return process.env.NODE_ENV === "development";
}
