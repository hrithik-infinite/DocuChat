import { describe, it, expect, vi, beforeEach } from "vitest";
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";

// Use vi.hoisted to ensure mockCreate is available when vi.mock runs
const { mockCreate } = vi.hoisted(() => {
  return { mockCreate: vi.fn() };
});

// Mock the @anthropic-ai/sdk module
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: mockCreate
      };
    }
  };
});

// Import the module under test after mocking
import { generateSummaryFromClaude } from "@/lib/claude";

describe("generateSummaryFromClaude", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.log and console.error during tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("successful summary generation", () => {
    it("should return the summary content from Claude response", async () => {
      const mockSummary = "# Document Summary\n\nThis is a test summary.";
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: mockSummary }]
      });

      const result = await generateSummaryFromClaude("Test PDF content");

      expect(result).toBe(mockSummary);
    });

    it("should handle empty summary content", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "" }]
      });

      const result = await generateSummaryFromClaude("Test PDF content");

      expect(result).toBe("");
    });
  });

  describe("correct parameters", () => {
    it("should call Claude with correct model", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Summary" }]
      });

      await generateSummaryFromClaude("Test content");

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "claude-sonnet-4-20250514"
        })
      );
    });

    it("should include system prompt", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Summary" }]
      });

      await generateSummaryFromClaude("Test content");

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          system: SUMMARY_SYSTEM_PROMPT
        })
      );
    });

    it("should include user message with PDF text", async () => {
      const pdfText = "This is the PDF content to summarize";
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Summary" }]
      });

      await generateSummaryFromClaude(pdfText);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining(pdfText)
            })
          ])
        })
      );
    });

    it("should use correct max_tokens of 2048", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Summary" }]
      });

      await generateSummaryFromClaude("Test content");

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 2048
        })
      );
    });

    it("should pass all parameters correctly in a single call", async () => {
      const pdfText = "Complete PDF text for testing";
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Summary" }]
      });

      await generateSummaryFromClaude(pdfText);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: SUMMARY_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Please summarize the following document in an engaging, easy-to-read summary. Use contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`
          }
        ]
      });
    });
  });

  describe("error handling - unexpected response format", () => {
    it("should throw error when response content is not text type", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "image", source: {} }]
      });

      await expect(generateSummaryFromClaude("Test content")).rejects.toThrow(
        "Unexpected response format from Claude"
      );
    });
  });

  describe("error handling - Error instance", () => {
    it("should throw and log Error instance errors", async () => {
      const testError = new Error("API rate limit exceeded");
      mockCreate.mockRejectedValueOnce(testError);

      await expect(generateSummaryFromClaude("Test content")).rejects.toThrow("API rate limit exceeded");

      expect(console.error).toHaveBeenCalledWith(
        "Error in generateSummaryFromClaude:",
        "API rate limit exceeded",
        expect.any(String)
      );
    });

    it("should throw network errors", async () => {
      const networkError = new Error("Network request failed");
      mockCreate.mockRejectedValueOnce(networkError);

      await expect(generateSummaryFromClaude("Test content")).rejects.toThrow("Network request failed");
    });

    it("should throw authentication errors", async () => {
      const authError = new Error("Invalid API key");
      mockCreate.mockRejectedValueOnce(authError);

      await expect(generateSummaryFromClaude("Test content")).rejects.toThrow("Invalid API key");
    });
  });

  describe("error handling - non-Error types", () => {
    it("should handle string errors", async () => {
      const stringError = "Something went wrong";
      mockCreate.mockRejectedValueOnce(stringError);

      await expect(generateSummaryFromClaude("Test content")).rejects.toBe(stringError);

      expect(console.error).toHaveBeenCalledWith("Unknown error in generateSummaryFromClaude:", stringError);
    });

    it("should handle object errors", async () => {
      const objectError = { code: "INTERNAL_ERROR", message: "Server error" };
      mockCreate.mockRejectedValueOnce(objectError);

      await expect(generateSummaryFromClaude("Test content")).rejects.toEqual(objectError);

      expect(console.error).toHaveBeenCalledWith("Unknown error in generateSummaryFromClaude:", objectError);
    });
  });

  describe("console logging", () => {
    it("should log when function is called with pdfText length", async () => {
      const pdfText = "Test PDF content here";
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Summary" }]
      });

      await generateSummaryFromClaude(pdfText);

      expect(console.log).toHaveBeenCalledWith(
        "generateSummaryFromClaude called with pdfText length:",
        pdfText.length
      );
    });

    it("should log the model being used", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Summary" }]
      });

      await generateSummaryFromClaude("Test content");

      expect(console.log).toHaveBeenCalledWith("Sending request to Claude with model: claude-sonnet-4-20250514");
    });

    it("should log when Claude response is received", async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Summary" }]
      });

      await generateSummaryFromClaude("Test content");

      expect(console.log).toHaveBeenCalledWith("Claude response received");
    });
  });

  describe("edge cases", () => {
    it("should handle very long PDF text", async () => {
      const longText = "A".repeat(100000);
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Summary of long document" }]
      });

      const result = await generateSummaryFromClaude(longText);

      expect(result).toBe("Summary of long document");
    });

    it("should handle special characters in PDF text", async () => {
      const specialCharsText = "Test with special chars: <>&\"'`${}[]()";
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Summary" }]
      });

      await generateSummaryFromClaude(specialCharsText);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining(specialCharsText)
            })
          ])
        })
      );
    });

    it("should handle unicode characters in PDF text", async () => {
      const unicodeText = "Unicode test: Hello World";
      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "Summary" }]
      });

      await generateSummaryFromClaude(unicodeText);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining(unicodeText)
            })
          ])
        })
      );
    });
  });
});
