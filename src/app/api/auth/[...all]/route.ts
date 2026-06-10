import { getAuth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
export async function GET(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const auth = getAuth(env, request.url);
  return auth.handler(request);
}

export async function POST(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const auth = getAuth(env, request.url);
  return auth.handler(request);
}
