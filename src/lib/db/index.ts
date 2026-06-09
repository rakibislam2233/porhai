import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/lib/db/schema";

export function getDb(env: any) {
  const connectionString =
    process.env.NODE_ENV === "development"
      ? process.env.DATABASE_URL
      : env.HYPERDRIVE?.connectionString ||
        env.DATABASE_URL ||
        process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Database connection string is missing!");
  }

  const client = postgres(connectionString, {
    fetch_types: false,
    prepare: false,
    max: 1,
  });

  return drizzle(client, { schema });
}
