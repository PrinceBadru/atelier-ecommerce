import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5433/atelier";

const isLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1") ||
  connectionString.includes("atelier-postgres");

// Disable prefetch for serverless/Next.js compatibility
const client = postgres(connectionString, {
  prepare: false,
  max: 10,
  ssl: isLocal ? false : "require",
});

export const db = drizzle(client, { schema });
