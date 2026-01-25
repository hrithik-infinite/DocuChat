"use server";

import { getDbConnection } from "@/lib/db";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromClaude } from "@/lib/claude";
import { SummaryTemplate, DEFAULT_TEMPLATE } from "@/types/templates";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { revalidatePath } from "next/cache";

export async function generatePdfText({ pdfUrl }: { pdfUrl: string }) {
  console.log("generatePdfSummary called with uploadResponse:");

  if (!pdfUrl) {
    console.error("No uploadResponse received");
    return {
      success: false,
      message: "File upload failed",
      data: null
    };
  }

  console.log("Extracted pdfUrl:", pdfUrl);

  if (!pdfUrl) {
    console.error("No pdfUrl found in uploadResponse");
    return {
      success: false,
      message: "File upload failed",
      data: null
    };
  }

  try {
    console.log("Fetching and extracting PDF text from:", pdfUrl);
    const pdfText = await fetchAndExtractPdfText(pdfUrl);
    console.log("Extracted PDF text length:", pdfText?.length);

    if (!pdfText) {
      console.error("Summary generation failed");
      return {
        success: false,
        message: "Failed to generate Summary",
        data: null
      };
    }
    return {
      success: true,
      message: "Summary generated successfully",
      data: {
        pdfText
      }
    };
  } catch (err) {
    console.error("Error in generatePdfSummary:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : String(err),
      data: null
    };
  }
}

export async function generatePdfSummary({
  pdfText,
  template = DEFAULT_TEMPLATE
}: {
  pdfText: string;
  template?: SummaryTemplate;
}) {
  console.log("generatePdfSummary called with template:", template);

  try {
    let summary;
    try {
      console.log("Generating summary from Claude...");
      summary = await generateSummaryFromClaude(pdfText, template);
      console.log("Summary generated:");
    } catch (e) {
      console.error("Error generating summary from Claude:", e);
    }
    if (!summary) {
      console.error("Summary generation failed");
      return {
        success: false,
        message: "Failed to generate Summary",
        data: null
      };
    }
    return {
      success: true,
      message: "Summary generated successfully",
      data: {
        summary,
      }
    };
  } catch (err) {
    console.error("Error in generatePdfSummary:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : String(err),
      data: null
    };
  }
}
async function savePdfSummaryDB({ userId, fileUrl, summary, title, fileName }: { userId: string; fileUrl: string; summary: string; title: string; fileName: string }) {
  try {
    const sql = await getDbConnection();
    const [savedSummary] = await sql`INSERT INTO pdf_summaries (
    user_id,
    original_file_url,
    summary_text,
    title,
    file_name
  ) values(
    ${userId},
    ${fileUrl},
    ${summary},
    ${title},
    ${fileName}
  ) RETURNING id, summary_text;`;
    return savedSummary;
  } catch (e) {
    console.error("Error saving pd dsumamry", e);
    throw e;
  }
}

export async function storePdfSummaryAction({ fileUrl, summary, title, fileName }: { fileUrl: string; summary: string; title: string; fileName: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let savePdfSummary: any;
  try {
    const { user } = await withAuth();
    if (!user?.id) {
      return {
        success: false,
        message: "User not found"
      };
    }
    savePdfSummary = await savePdfSummaryDB({ userId: user.id, fileUrl, summary, title, fileName });
    if (!savePdfSummary) {
      return {
        success: false,
        message: "Failed to save summary"
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error saving PDF summary"
    };
  }
  revalidatePath(`/summaries/${savePdfSummary.id}`);
  return {
    success: true,
    message: "Failed to save summary",
    data: {
      id: savePdfSummary.id
    }
  };
}
