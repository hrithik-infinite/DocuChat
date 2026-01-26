import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { db } from "@/lib/db";
import { pdfSummaries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateChatResponse, generateChatResponseWithFullDoc, ChatMessage } from "@/lib/chat";
import { chunkDocument, getRelevantChunks, buildContext } from "@/lib/chunking";

// Maximum characters before we use chunking (roughly 50k tokens)
const MAX_FULL_DOC_LENGTH = 150000;

export async function POST(request: NextRequest) {
  try {
    const { user } = await withAuth();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { summaryId, message, conversationHistory = [] } = body;

    if (!summaryId || !message) {
      return NextResponse.json(
        { error: "summaryId and message are required" },
        { status: 400 }
      );
    }

    // Get the summary and verify ownership
    const [summary] = await db
      .select({
        id: pdfSummaries.id,
        userId: pdfSummaries.userId,
        originalText: pdfSummaries.originalText,
        summaryText: pdfSummaries.summaryText,
        title: pdfSummaries.title,
      })
      .from(pdfSummaries)
      .where(eq(pdfSummaries.id, summaryId));

    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    if (summary.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the document text (prefer originalText, fall back to summaryText)
    const documentText = summary.originalText || summary.summaryText;

    if (!documentText) {
      return NextResponse.json(
        { error: "No document content available" },
        { status: 400 }
      );
    }

    let answer: string;

    // For smaller documents, use the full document in context
    if (documentText.length <= MAX_FULL_DOC_LENGTH) {
      answer = await generateChatResponseWithFullDoc(
        documentText,
        message,
        conversationHistory as ChatMessage[]
      );
    } else {
      // For larger documents, use chunking and retrieval
      const chunks = chunkDocument(documentText, 1500, 200);
      const relevantChunks = getRelevantChunks(chunks, message, 5);

      if (relevantChunks.length === 0) {
        // If no relevant chunks found, use first few chunks as context
        const fallbackChunks = chunks.slice(0, 3);
        const context = buildContext(fallbackChunks);
        answer = await generateChatResponse(context, message, conversationHistory as ChatMessage[]);
      } else {
        const context = buildContext(relevantChunks);
        answer = await generateChatResponse(context, message, conversationHistory as ChatMessage[]);
      }
    }

    return NextResponse.json({
      answer,
      summaryId,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
