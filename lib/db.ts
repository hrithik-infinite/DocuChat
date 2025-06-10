"use server";
import { neon } from "@neondatabase/serverless";

export async function getDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Neon Database URL not dfined");
  }
  const sql = neon(process.env.DATABASE_URL);
  return sql;
}
