import { getDb } from "@/lib/db/index";
import * as schema from "@/lib/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export function getAuth(env: any) {
  const db = getDb(env);
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        users: schema.users,
        sessions: schema.sessions,
        accounts: schema.accounts,
        verifications: schema.verifications,
      },
      usePlural: true,
    }),
    baseURL: env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL!,
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
