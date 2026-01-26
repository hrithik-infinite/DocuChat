import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CHAT_SYSTEM_PROMPT = `You are a helpful assistant that answers questions about documents. You have been given relevant sections from a document to help answer the user's question.

Guidelines:
- Answer based ONLY on the provided document context
- If the answer cannot be found in the context, say "I couldn't find information about that in the document"
- Be concise but thorough
- Use bullet points for lists when appropriate
- Quote relevant passages when helpful
- If the question is ambiguous, ask for clarification

Document context will be provided in the user's message.`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateChatResponse(
  context: string,
  question: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    // Build the messages array with conversation history
    const messages: Anthropic.MessageParam[] = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add the current question with context
    const userMessage = context
      ? `Here is the relevant context from the document:\n\n${context}\n\n---\n\nQuestion: ${question}`
      : `Question: ${question}`;

    messages.push({
      role: "user",
      content: userMessage,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: CHAT_SYSTEM_PROMPT,
      messages,
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }

    throw new Error("Unexpected response format from Claude");
  } catch (error) {
    console.error("Error in generateChatResponse:", error);
    throw error;
  }
}

/**
 * Generate a response using the full document (for smaller documents)
 * This avoids the need for chunking when the document fits in context
 */
export async function generateChatResponseWithFullDoc(
  documentText: string,
  question: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const systemPrompt = `You are a helpful assistant that answers questions about a document. The full document has been provided to you.

Guidelines:
- Answer based ONLY on the provided document
- If the answer cannot be found in the document, say "I couldn't find information about that in the document"
- Be concise but thorough
- Use bullet points for lists when appropriate
- Quote relevant passages when helpful
- If the question is ambiguous, ask for clarification

Here is the document:

${documentText}`;

  try {
    const messages: Anthropic.MessageParam[] = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    messages.push({
      role: "user",
      content: question,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0];
    if (content.type === "text") {
      return content.text;
    }

    throw new Error("Unexpected response format from Claude");
  } catch (error) {
    console.error("Error in generateChatResponseWithFullDoc:", error);
    throw error;
  }
}
