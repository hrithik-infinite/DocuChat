import { getDbConnection } from "@/lib/db";

export async function getPriceId(email: string) {
  const sql = await getDbConnection();
  const query = await sql`SELECT price_id FROM users where email = ${email} AND status = 'active'`;
  return query?.[0]?.price_id || null;
}
