"use server";

import { db } from "@/lib/db";
import { pdfSummaries } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { revalidatePath } from "next/cache";

export async function deleteSummaryAction({ summaryId }: { summaryId: string }) {
  try {
    const { user } = await withAuth();
    const userId = user?.id;
    if (!userId) {
      throw new Error("User not found");
    }
    const result = await db
      .delete(pdfSummaries)
      .where(and(eq(pdfSummaries.id, summaryId), eq(pdfSummaries.userId, userId)))
      .returning({ id: pdfSummaries.id });

    if (result.length > 0) {
      revalidatePath("/dashboard");
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error("Error deleting summary", error);
    return { success: false };
  }
}
