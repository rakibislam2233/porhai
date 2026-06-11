import { getDb } from "@/lib/db/index";
import { accounts, sessions, users, verifications } from "@/lib/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export function getAuth(env: CloudflareEnv, requestUrl?: string) {
  const db = getDb(env);
  const baseURL =
    (env as any).NEXT_PUBLIC_APP_URL ||
    (requestUrl ? new URL(requestUrl).origin : "http://localhost:3000");

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        users: users,
        sessions: sessions,
        accounts: accounts,
        verifications: verifications,
      },
      usePlural: true,
    }),
    baseURL: baseURL,
    secret: env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET!,
    // ✅ Social Providers
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID!,
        clientSecret:
          env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET!,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID!,
        clientSecret:
          env.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET!,
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "github"],
      },
    },
  });
}
export type Auth = ReturnType<typeof getAuth>;
