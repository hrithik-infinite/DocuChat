import { describe, it, expect, vi, beforeEach } from "vitest";
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";

// Use vi.hoisted to ensure mockCreate is available when vi.mock runs
const { mockCreate } = vi.hoisted(() => {
  return { mockCreate: vi.fn() };
});

// Mock the openai module with a class-based constructor
vi.mock("openai", () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate
        }
      };
    }
  };
});

// Import the module under test after mocking
import { generateSummaryFromOpenAI } from "@/lib/openai";

describe("generateSummaryFromOpenAI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.log and console.error during tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("successful summary generation", () => {
    it("should return the summary content from OpenAI response", async () => {
      const mockSummary = "# Document Summary\n\nThis is a test summary.";
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: mockSummary
            }
          }
        ]
      });

      const result = await generateSummaryFromOpenAI("Test PDF content");

      expect(result).toBe(mockSummary);
    });

    it("should handle empty summary content", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: ""
            }
          }
        ]
      });

      const result = await generateSummaryFromOpenAI("Test PDF content");

      expect(result).toBe("");
    });

    it("should handle null summary content", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: null
            }
          }
        ]
      });

      const result = await generateSummaryFromOpenAI("Test PDF content");

      expect(result).toBeNull();
    });
  });

  describe("correct parameters", () => {
    it("should call OpenAI with correct model gpt-4.1-nano", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary" } }]
      });

      await generateSummaryFromOpenAI("Test content");

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-4.1-nano"
        })
      );
    });

    it("should include system prompt in messages", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary" } }]
      });

      await generateSummaryFromOpenAI("Test content");

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "system",
              content: SUMMARY_SYSTEM_PROMPT
            })
          ])
        })
      );
    });

    it("should include user message with PDF text", async () => {
      const pdfText = "This is the PDF content to summarize";
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary" } }]
      });

      await generateSummaryFromOpenAI(pdfText);

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

    it("should use correct temperature of 0.7", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary" } }]
      });

      await generateSummaryFromOpenAI("Test content");

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7
        })
      );
    });

    it("should use correct max_tokens of 1500", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary" } }]
      });

      await generateSummaryFromOpenAI("Test content");

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 1500
        })
      );
    });

    it("should pass all parameters correctly in a single call", async () => {
      const pdfText = "Complete PDF text for testing";
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary" } }]
      });

      await generateSummaryFromOpenAI(pdfText);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
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
    });
  });

  describe("error handling - Error instance", () => {
    it("should throw and log Error instance errors", async () => {
      const testError = new Error("API rate limit exceeded");
      mockCreate.mockRejectedValueOnce(testError);

      await expect(generateSummaryFromOpenAI("Test content")).rejects.toThrow("API rate limit exceeded");

      expect(console.error).toHaveBeenCalledWith(
        "Error in generateSummaryFromOpenAI:",
        "API rate limit exceeded",
        expect.any(String)
      );
    });

    it("should throw network errors", async () => {
      const networkError = new Error("Network request failed");
      mockCreate.mockRejectedValueOnce(networkError);

      await expect(generateSummaryFromOpenAI("Test content")).rejects.toThrow("Network request failed");
    });

    it("should throw authentication errors", async () => {
      const authError = new Error("Invalid API key");
      mockCreate.mockRejectedValueOnce(authError);

      await expect(generateSummaryFromOpenAI("Test content")).rejects.toThrow("Invalid API key");
    });

    it("should throw timeout errors", async () => {
      const timeoutError = new Error("Request timeout");
      mockCreate.mockRejectedValueOnce(timeoutError);

      await expect(generateSummaryFromOpenAI("Test content")).rejects.toThrow("Request timeout");
    });

    it("should include error stack in console.error for Error instances", async () => {
      const errorWithStack = new Error("Test error with stack");
      mockCreate.mockRejectedValueOnce(errorWithStack);

      await expect(generateSummaryFromOpenAI("Test content")).rejects.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        "Error in generateSummaryFromOpenAI:",
        "Test error with stack",
        expect.stringContaining("Error: Test error with stack")
      );
    });
  });

  describe("error handling - non-Error types", () => {
    it("should handle string errors", async () => {
      const stringError = "Something went wrong";
      mockCreate.mockRejectedValueOnce(stringError);

      await expect(generateSummaryFromOpenAI("Test content")).rejects.toBe(stringError);

      expect(console.error).toHaveBeenCalledWith("Unknown error in generateSummaryFromOpenAI:", stringError);
    });

    it("should handle number errors", async () => {
      const numberError = 500;
      mockCreate.mockRejectedValueOnce(numberError);

      await expect(generateSummaryFromOpenAI("Test content")).rejects.toBe(numberError);

      expect(console.error).toHaveBeenCalledWith("Unknown error in generateSummaryFromOpenAI:", numberError);
    });

    it("should handle object errors", async () => {
      const objectError = { code: "INTERNAL_ERROR", message: "Server error" };
      mockCreate.mockRejectedValueOnce(objectError);

      await expect(generateSummaryFromOpenAI("Test content")).rejects.toEqual(objectError);

      expect(console.error).toHaveBeenCalledWith("Unknown error in generateSummaryFromOpenAI:", objectError);
    });

    it("should handle null errors", async () => {
      mockCreate.mockRejectedValueOnce(null);

      await expect(generateSummaryFromOpenAI("Test content")).rejects.toBeNull();

      expect(console.error).toHaveBeenCalledWith("Unknown error in generateSummaryFromOpenAI:", null);
    });

    it("should handle undefined errors", async () => {
      mockCreate.mockRejectedValueOnce(undefined);

      await expect(generateSummaryFromOpenAI("Test content")).rejects.toBeUndefined();

      expect(console.error).toHaveBeenCalledWith("Unknown error in generateSummaryFromOpenAI:", undefined);
    });

    it("should handle array errors", async () => {
      const arrayError = ["error1", "error2"];
      mockCreate.mockRejectedValueOnce(arrayError);

      await expect(generateSummaryFromOpenAI("Test content")).rejects.toEqual(arrayError);

      expect(console.error).toHaveBeenCalledWith("Unknown error in generateSummaryFromOpenAI:", arrayError);
    });
  });

  describe("console logging", () => {
    it("should log when function is called with pdfText length", async () => {
      const pdfText = "Test PDF content here";
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary" } }]
      });

      await generateSummaryFromOpenAI(pdfText);

      expect(console.log).toHaveBeenCalledWith(
        "generateSummaryFromOpenAI called with pdfText length:",
        pdfText.length
      );
    });

    it("should log the model being used", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary" } }]
      });

      await generateSummaryFromOpenAI("Test content");

      expect(console.log).toHaveBeenCalledWith("Sending request to OpenAI with model: gpt-4.1-nano");
    });

    it("should log the OpenAI response", async () => {
      const mockResponse = {
        choices: [{ message: { content: "Summary" } }]
      };
      mockCreate.mockResolvedValueOnce(mockResponse);

      await generateSummaryFromOpenAI("Test content");

      expect(console.log).toHaveBeenCalledWith("OpenAI response received:", mockResponse);
    });

    it("should handle undefined pdfText length gracefully", async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary" } }]
      });

      await generateSummaryFromOpenAI(undefined as unknown as string);

      expect(console.log).toHaveBeenCalledWith(
        "generateSummaryFromOpenAI called with pdfText length:",
        undefined
      );
    });
  });

  describe("edge cases", () => {
    it("should handle very long PDF text", async () => {
      const longText = "A".repeat(100000);
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary of long document" } }]
      });

      const result = await generateSummaryFromOpenAI(longText);

      expect(result).toBe("Summary of long document");
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining(longText)
            })
          ])
        })
      );
    });

    it("should handle special characters in PDF text", async () => {
      const specialCharsText = "Test with special chars: <>&\"'`${}[]()";
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary" } }]
      });

      await generateSummaryFromOpenAI(specialCharsText);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining(specialCharsText)
            })
          ])
        })
      );
    });

    it("should handle unicode characters in PDF text", async () => {
      const unicodeText = "Unicode test: Hello World";
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary" } }]
      });

      await generateSummaryFromOpenAI(unicodeText);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining(unicodeText)
            })
          ])
        })
      );
    });

    it("should handle newlines and formatting in PDF text", async () => {
      const formattedText = "Line 1\nLine 2\n\nParagraph 2\n\tIndented";
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: "Summary" } }]
      });

      await generateSummaryFromOpenAI(formattedText);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: "user",
              content: expect.stringContaining(formattedText)
            })
          ])
        })
      );
    });
  });
});
