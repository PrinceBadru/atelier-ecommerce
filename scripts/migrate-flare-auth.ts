import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";

async function run() {
  const renderDbUrl =
    "postgresql://atelier_user:N019D8dg6PC2DWn39E4SD7cgoTxURgge@dpg-dbfi9e67bikc73dlvnt0-a.oregon-postgres.render.com:5432/atelier_suaw";
  const connectionString = process.env.DATABASE_URL?.includes("render.com")
    ? process.env.DATABASE_URL
    : renderDbUrl;

  console.log("Connecting to PostgreSQL at:", connectionString.replace(/:[^:@]+@/, ":***@"));

  const isLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1") ||
    connectionString.includes("atelier-postgres");

  const sql = postgres(connectionString, {
    max: 1,
    ssl: isLocal ? false : "require",
  });

  console.log("Applying Flare Auth PostgreSQL schema migration...");

  await sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS banned boolean DEFAULT false;
  `;
  await sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason text;
  `;
  await sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_expires timestamp with time zone;
  `;
  await sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false NOT NULL;
  `;

  await sql`
    ALTER TABLE sessions ADD COLUMN IF NOT EXISTS impersonated_by text;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS passkeys (
      id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name text,
      public_key text NOT NULL,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      credential_id text NOT NULL,
      counter integer NOT NULL,
      device_type text NOT NULL,
      backed_up boolean NOT NULL,
      transports text,
      created_at timestamp with time zone DEFAULT now(),
      aaguid text
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS passkey_user_idx ON passkeys (user_id);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS passkey_credential_idx ON passkeys (credential_id);
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS two_factors (
      id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
      secret text NOT NULL,
      backup_codes text NOT NULL,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      verified boolean DEFAULT true,
      failed_verification_count integer DEFAULT 0,
      locked_until timestamp with time zone
    );
  `;

  await sql`
    ALTER TABLE two_factors ADD COLUMN IF NOT EXISTS verified boolean DEFAULT true;
  `;
  await sql`
    ALTER TABLE two_factors ADD COLUMN IF NOT EXISTS failed_verification_count integer DEFAULT 0;
  `;
  await sql`
    ALTER TABLE two_factors ADD COLUMN IF NOT EXISTS locked_until timestamp with time zone;
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS two_factor_user_idx ON two_factors (user_id);
  `;

  console.log("Flare Auth schema migration completed successfully!");
  await sql.end();
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
