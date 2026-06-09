import { getAuth } from "@/lib/auth";
import { getEnv } from "@/lib/cf-env";
export async function GET(request: Request) {
  const env = await getEnv();
  const auth = getAuth(env);
  return auth.handler(request);
}

export async function POST(request: Request) {
  const env = await getEnv();
  const auth = getAuth(env);
  return auth.handler(request);
}
