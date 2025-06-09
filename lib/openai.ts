import OpenAI from "openai";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateSummaryFromOpenAI(pdfText: string) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Talk like a pirate."
        },
        {
          role: "user",
          content: ""
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    return response.choices[0].message.content;
  } catch (e: any) {
    console.error(e);
    throw e;
  }
}
