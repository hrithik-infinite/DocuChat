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
  if (!uploadResponse) {
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
  if (!pdfUrl) {
    return {
      success: false,
      message: "File upload failed",
      data: null
    };
  }

  try {
    const pdfText = await fetchAndExtractPdfText(pdfUrl);
    let summary;
    try {
      summary = await generateSummaryFromOpenAI(pdfText);
      console.log(summary);
    } catch (e) {
      console.error(e);
    }
    if (!summary) {
      return {
        success: false,
        message: "Failed to generate Summary",
        data: null
      };
    }
  } catch (err) {
    return {
      success: false,
      message: err,
      data: null
    };
  }
}
