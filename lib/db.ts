import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

// Create neon client
const sql = neon(process.env.DATABASE_URL!);

// Create drizzle database instance with schema
export const db = drizzle(sql, { schema });

// Legacy function for backwards compatibility during migration
export async function getDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Neon Database URL not defined");
  }
  return neon(process.env.DATABASE_URL);
}

// Re-export schema for convenience
export { schema };
