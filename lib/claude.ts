import Anthropic from "@anthropic-ai/sdk";
import { getPromptForTemplate } from "@/utils/prompts";
import { SummaryTemplate, DEFAULT_TEMPLATE } from "@/types/templates";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generateSummaryFromClaude(
  pdfText: string,
  template: SummaryTemplate = DEFAULT_TEMPLATE
) {
  console.log("generateSummaryFromClaude called with pdfText length:", pdfText?.length);
  console.log("Using template:", template);
  try {
    const systemPrompt = getPromptForTemplate(template);
    console.log("Sending request to Claude with model: claude-sonnet-4-20250514");
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Please summarize the following document in an engaging, easy-to-read summary. Use contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`
        }
      ]
    });
    console.log("Claude response received");

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }

    throw new Error("Unexpected response format from Claude");
  } catch (e) {
    if (e instanceof Error) {
      console.error("Error in generateSummaryFromClaude:", e.message, e.stack);
    } else {
      console.error("Unknown error in generateSummaryFromClaude:", e);
    }
    throw e;
  }
}
