"use server";

import { getDbConnection } from "@/lib/db";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";

export async function generatePdfSummary(
  uploadResponse: [
    {
      serverData: {
        userId: string;
        file: {
          url: string;
          name: string;
        };
      };
    }
  ]
) {
  console.log("generatePdfSummary called with uploadResponse:", uploadResponse);

  if (!uploadResponse) {
    console.error("No uploadResponse received");
    return {
      success: false,
      message: "File upload failed",
      data: null
    };
  }

  const {
    serverData: {
      userId,
      file: { url: pdfUrl, name: fileName }
    }
  } = uploadResponse[0];

  console.log("Extracted userId:", userId);
  console.log("Extracted pdfUrl:", pdfUrl);
  console.log("Extracted fileName:", fileName);

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

    let summary;
    try {
      console.log("Generating summary from OpenAI...");
      summary = await generateSummaryFromOpenAI(pdfText);
      console.log("Summary generated:");
    } catch (e) {
      console.error("Error generating summary from OpenAI:", e);
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
        summary
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
    await sql`INSERT INTO pdf_summaries (
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
  );`;
  } catch (e) {
    console.error("Error saving pd dsumamry", e);
    throw e;
  }
}

export async function storePdfSummaryAction({ fileUrl, summary, title, fileName }: { fileUrl: string; summary: string; title: string; fileName: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let savePdfSummary: any;
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "User not found"
      };
    }
    savePdfSummary = await savePdfSummaryDB({ userId, fileUrl, summary, title, fileName });
    if (!savePdfSummary) {
      return {
        success: false,
        message: "Failed to save summary"
      };
    }
     return {
        success: true,
        message: "Failed to save summary"
      };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error saving PDF summary"
    };
  }
}
