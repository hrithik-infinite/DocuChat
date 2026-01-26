/**
 * Document chunking utilities for RAG (Retrieval-Augmented Generation)
 * Splits documents into overlapping chunks for better context retrieval
 */

export interface DocumentChunk {
  content: string;
  chunkIndex: number;
  startChar: number;
  endChar: number;
}

/**
 * Split text into overlapping chunks
 * @param text - The document text to chunk
 * @param chunkSize - Target size of each chunk in characters (default: 1000)
 * @param overlap - Number of overlapping characters between chunks (default: 200)
 * @returns Array of document chunks with metadata
 */
export function chunkDocument(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): DocumentChunk[] {
  if (!text || text.length === 0) {
    return [];
  }

  // If text is smaller than chunk size, return as single chunk
  if (text.length <= chunkSize) {
    return [
      {
        content: text,
        chunkIndex: 0,
        startChar: 0,
        endChar: text.length,
      },
    ];
  }

  const chunks: DocumentChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

    // If this isn't the last chunk, try to break at a sentence or paragraph
    if (endIndex < text.length) {
      // Look for paragraph break
      const paragraphBreak = text.lastIndexOf("\n\n", endIndex);
      if (paragraphBreak > startIndex + chunkSize / 2) {
        endIndex = paragraphBreak + 2;
      } else {
        // Look for sentence break
        const sentenceBreak = findLastSentenceBreak(text, startIndex, endIndex);
        if (sentenceBreak > startIndex + chunkSize / 2) {
          endIndex = sentenceBreak;
        }
      }
    } else {
      endIndex = text.length;
    }

    const content = text.slice(startIndex, endIndex).trim();

    if (content.length > 0) {
      chunks.push({
        content,
        chunkIndex,
        startChar: startIndex,
        endChar: endIndex,
      });
      chunkIndex++;
    }

    // Move start index forward, accounting for overlap
    startIndex = endIndex - overlap;

    // Prevent infinite loop if overlap is larger than chunk
    if (startIndex <= chunks[chunks.length - 1]?.startChar) {
      startIndex = endIndex;
    }
  }

  return chunks;
}

/**
 * Find the last sentence break (., !, ?) within a range
 */
function findLastSentenceBreak(
  text: string,
  start: number,
  end: number
): number {
  let lastBreak = -1;
  const sentenceEnders = [".", "!", "?"];

  for (let i = end - 1; i > start; i--) {
    if (sentenceEnders.includes(text[i])) {
      // Make sure it's followed by a space or end of text
      if (i + 1 >= text.length || text[i + 1] === " " || text[i + 1] === "\n") {
        lastBreak = i + 1;
        break;
      }
    }
  }

  return lastBreak;
}

/**
 * Get the most relevant chunks for a query using simple keyword matching
 * This is a basic implementation - can be enhanced with embeddings later
 */
export function getRelevantChunks(
  chunks: DocumentChunk[],
  query: string,
  maxChunks: number = 5
): DocumentChunk[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  // Score each chunk based on keyword matches
  const scoredChunks = chunks.map(chunk => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;

    for (const word of queryWords) {
      const regex = new RegExp(word, "gi");
      const matches = contentLower.match(regex);
      if (matches) {
        score += matches.length;
      }
    }

    return { chunk, score };
  });

  // Sort by score and return top chunks
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, maxChunks)
    .filter(sc => sc.score > 0)
    .map(sc => sc.chunk);
}

/**
 * Combine chunks into a context string for the LLM
 */
export function buildContext(chunks: DocumentChunk[]): string {
  if (chunks.length === 0) {
    return "";
  }

  // Sort chunks by their position in the document
  const sortedChunks = [...chunks].sort((a, b) => a.chunkIndex - b.chunkIndex);

  return sortedChunks
    .map((chunk, i) => `[Section ${i + 1}]\n${chunk.content}`)
    .join("\n\n---\n\n");
}
