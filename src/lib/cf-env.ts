import { getCloudflareContext } from "@opennextjs/cloudflare";

function getDevEnv(): CloudflareEnv {
  return process.env as unknown as CloudflareEnv;
}

export async function getEnv(): Promise<CloudflareEnv> {
  if (process.env.NODE_ENV === "development") {
    return getDevEnv();
  }

  const { env } = await getCloudflareContext({ async: true });
  return env;
}

export function isDevRuntime() {
  return process.env.NODE_ENV === "development";
}
