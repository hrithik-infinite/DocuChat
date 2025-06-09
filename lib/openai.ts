import { SUMMARY_SYSTEM_PROMPT } from "./../utils/prompts";
import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateSummaryFromOpenAI(pdfText: string) {
  console.log("generateSummaryFromOpenAI called with pdfText length:", pdfText?.length);
  try {
    console.log("Sending request to OpenAI with model: gpt-4.1-nano");
    const response = await client.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: SUMMARY_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: `Please summarize the following document in an engaging, easy-to-read summary. Use contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    console.log("OpenAI response received:", response);
    return response.choices[0].message.content;
  } catch (e) {
    if (e instanceof Error) {
      console.error("Error in generateSummaryFromOpenAI:", e.message, e.stack);
    } else {
      console.error("Unknown error in generateSummaryFromOpenAI:", e);
    }
    throw e;
  }
}
