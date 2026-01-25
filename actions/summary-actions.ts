"use server";

import { getDbConnection } from "@/lib/db";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { revalidatePath } from "next/cache";

export async function deleteSummaryAction({ summaryId }: { summaryId: string }) {
  try {
    const { user } = await withAuth();
    const userId = user?.id;
    if (!userId) {
      throw new Error("User not found");
    }
    const sql = await getDbConnection();
    const result = await sql`DELETE FROM pdf_summaries where id = ${summaryId} and user_id = ${userId} RETURNING id;`;
    if (result.length > 0) {
      revalidatePath("/dashboard");
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error("Error deleting sumamry", error);
    return { success: false };
  }
}
