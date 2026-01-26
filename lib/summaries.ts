import { db } from "./db";
import { pdfSummaries } from "@/db/schema";
import { eq, desc, sql, count } from "drizzle-orm";

export async function getSummaries(userId: string) {
  const summaries = await db
    .select()
    .from(pdfSummaries)
    .where(eq(pdfSummaries.userId, userId))
    .orderBy(desc(pdfSummaries.createdAt));
  return summaries;
}

export async function getSummaryById(id: string) {
  try {
    const [summary] = await db
      .select({
        id: pdfSummaries.id,
        user_id: pdfSummaries.userId,
        title: pdfSummaries.title,
        original_file_url: pdfSummaries.originalFileUrl,
        summary_text: pdfSummaries.summaryText,
        original_text: pdfSummaries.originalText,
        status: pdfSummaries.status,
        created_at: pdfSummaries.createdAt,
        updated_at: pdfSummaries.updatedAt,
        file_name: pdfSummaries.fileName,
        word_count: sql<number>`LENGTH(${pdfSummaries.summaryText}) - LENGTH(REPLACE(${pdfSummaries.summaryText}, ' ', '')) + 1`,
      })
      .from(pdfSummaries)
      .where(eq(pdfSummaries.id, id));

    return summary;
  } catch (err) {
    console.error("Error fetching summary by id", err);
    return null;
  }
}

export async function getUserUploadCount(userId: string) {
  try {
    const [result] = await db
      .select({ count: count() })
      .from(pdfSummaries)
      .where(eq(pdfSummaries.userId, userId));
    return result?.count || 0;
  } catch (e) {
    console.error("error in upload count", e);
    return 0;
  }
}
