"use server";

import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";

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
      data: summary
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
