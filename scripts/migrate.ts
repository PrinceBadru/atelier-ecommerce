import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

async function runMigration() {
  const connectionString =
    process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5433/atelier";
  console.log("Connecting to PostgreSQL at:", connectionString.replace(/:[^:@]+@/, ":***@"));

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log("Applying migrations from ./lib/db/migrations...");
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  console.log("Migrations applied successfully!");

  await sql.end();
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
