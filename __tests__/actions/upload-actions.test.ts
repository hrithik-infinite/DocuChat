import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules before importing
vi.mock("@/lib/db", () => ({
  getDbConnection: vi.fn(),
}));

vi.mock("@/lib/langchain", () => ({
  fetchAndExtractPdfText: vi.fn(),
}));

vi.mock("@/lib/openai", () => ({
  generateSummaryFromOpenAI: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { generatePdfText, generatePdfSummary, storePdfSummaryAction } from "@/actions/upload-actions";
import { getDbConnection } from "@/lib/db";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const mockGetDbConnection = vi.mocked(getDbConnection);
const mockFetchAndExtractPdfText = vi.mocked(fetchAndExtractPdfText);
const mockGenerateSummaryFromOpenAI = vi.mocked(generateSummaryFromOpenAI);
const mockAuth = vi.mocked(auth);
const mockRevalidatePath = vi.mocked(revalidatePath);

describe("generatePdfText", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return failure when pdfUrl is empty", async () => {
    const result = await generatePdfText({ pdfUrl: "" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("File upload failed");
    expect(result.data).toBeNull();
  });

  it("should successfully extract PDF text", async () => {
    const mockPdfText = "This is the extracted PDF text content";
    mockFetchAndExtractPdfText.mockResolvedValue(mockPdfText);

    const result = await generatePdfText({ pdfUrl: "https://example.com/test.pdf" });

    expect(mockFetchAndExtractPdfText).toHaveBeenCalledWith("https://example.com/test.pdf");
    expect(result.success).toBe(true);
    expect(result.message).toBe("Summary generated successfully");
    expect(result.data).toEqual({ pdfText: mockPdfText });
  });

  it("should return failure when pdfText extraction fails", async () => {
    mockFetchAndExtractPdfText.mockResolvedValue("");

    const result = await generatePdfText({ pdfUrl: "https://example.com/test.pdf" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to generate Summary");
    expect(result.data).toBeNull();
  });

  it("should handle errors during PDF extraction", async () => {
    const mockError = new Error("Network error");
    mockFetchAndExtractPdfText.mockRejectedValue(mockError);

    const result = await generatePdfText({ pdfUrl: "https://example.com/test.pdf" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Network error");
    expect(result.data).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it("should handle non-Error thrown values", async () => {
    mockFetchAndExtractPdfText.mockRejectedValue("String error");

    const result = await generatePdfText({ pdfUrl: "https://example.com/test.pdf" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("String error");
    expect(result.data).toBeNull();
  });

  it("should log extraction progress", async () => {
    mockFetchAndExtractPdfText.mockResolvedValue("Some text");

    await generatePdfText({ pdfUrl: "https://example.com/test.pdf" });

    expect(console.log).toHaveBeenCalledWith("Fetching and extracting PDF text from:", "https://example.com/test.pdf");
  });
});

describe("generatePdfSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should successfully generate summary from PDF text", async () => {
    const mockSummary = "This is a generated summary";
    mockGenerateSummaryFromOpenAI.mockResolvedValue(mockSummary);

    const result = await generatePdfSummary({ pdfText: "Some PDF content" });

    expect(mockGenerateSummaryFromOpenAI).toHaveBeenCalledWith("Some PDF content");
    expect(result.success).toBe(true);
    expect(result.message).toBe("Summary generated successfully");
    expect(result.data).toEqual({ summary: mockSummary });
  });

  it("should return failure when summary generation returns empty", async () => {
    mockGenerateSummaryFromOpenAI.mockResolvedValue("");

    const result = await generatePdfSummary({ pdfText: "Some PDF content" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to generate Summary");
    expect(result.data).toBeNull();
  });

  it("should return failure when OpenAI throws error", async () => {
    mockGenerateSummaryFromOpenAI.mockRejectedValue(new Error("OpenAI API error"));

    const result = await generatePdfSummary({ pdfText: "Some PDF content" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to generate Summary");
    expect(result.data).toBeNull();
    expect(console.error).toHaveBeenCalledWith("Error generating summary from OpenAI:", expect.any(Error));
  });

  it("should return failure when summary is null", async () => {
    mockGenerateSummaryFromOpenAI.mockResolvedValue(null as unknown as string);

    const result = await generatePdfSummary({ pdfText: "Some PDF content" });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to generate Summary");
  });

  it("should log summary generation progress", async () => {
    mockGenerateSummaryFromOpenAI.mockResolvedValue("Summary");

    await generatePdfSummary({ pdfText: "Some content" });

    expect(console.log).toHaveBeenCalledWith("Generating summary from OpenAI...");
    expect(console.log).toHaveBeenCalledWith("Summary generated:");
  });
});

describe("storePdfSummaryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return failure when user is not authenticated", async () => {
    mockAuth.mockResolvedValue({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    const result = await storePdfSummaryAction({
      fileUrl: "https://example.com/file.pdf",
      summary: "Test summary",
      title: "Test Title",
      fileName: "file.pdf"
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("User not found");
  });

  it("should successfully save PDF summary", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
    const mockSavedSummary = { id: "summary-456", summary_text: "Test summary" };
    const mockSql = vi.fn().mockResolvedValue([mockSavedSummary]);
    mockGetDbConnection.mockResolvedValue(mockSql as unknown as ReturnType<typeof getDbConnection> extends Promise<infer T> ? T : never);

    const result = await storePdfSummaryAction({
      fileUrl: "https://example.com/file.pdf",
      summary: "Test summary",
      title: "Test Title",
      fileName: "file.pdf"
    });

    expect(mockGetDbConnection).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: "summary-456" });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/summaries/summary-456");
  });

  it("should return failure when save returns empty result", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
    const mockSql = vi.fn().mockResolvedValue([undefined]);
    mockGetDbConnection.mockResolvedValue(mockSql as unknown as ReturnType<typeof getDbConnection> extends Promise<infer T> ? T : never);

    const result = await storePdfSummaryAction({
      fileUrl: "https://example.com/file.pdf",
      summary: "Test summary",
      title: "Test Title",
      fileName: "file.pdf"
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to save summary");
  });

  it("should handle database errors", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
    const mockError = new Error("Database connection failed");
    mockGetDbConnection.mockRejectedValue(mockError);

    const result = await storePdfSummaryAction({
      fileUrl: "https://example.com/file.pdf",
      summary: "Test summary",
      title: "Test Title",
      fileName: "file.pdf"
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Database connection failed");
  });

  it("should handle non-Error thrown values", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
    mockGetDbConnection.mockRejectedValue("String error");

    const result = await storePdfSummaryAction({
      fileUrl: "https://example.com/file.pdf",
      summary: "Test summary",
      title: "Test Title",
      fileName: "file.pdf"
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Error saving PDF summary");
  });

  it("should call database with correct parameters", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
    const mockSavedSummary = { id: "summary-789", summary_text: "Summary text" };
    const mockSql = vi.fn().mockResolvedValue([mockSavedSummary]);
    mockGetDbConnection.mockResolvedValue(mockSql as unknown as ReturnType<typeof getDbConnection> extends Promise<infer T> ? T : never);

    await storePdfSummaryAction({
      fileUrl: "https://example.com/file.pdf",
      summary: "Test summary content",
      title: "My Document",
      fileName: "document.pdf"
    });

    expect(mockSql).toHaveBeenCalled();
    expect(mockGetDbConnection).toHaveBeenCalled();
  });

  it("should handle query execution error", async () => {
    mockAuth.mockResolvedValue({ userId: "user-123" } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
    const mockSql = vi.fn().mockRejectedValue(new Error("Query failed"));
    mockGetDbConnection.mockResolvedValue(mockSql as unknown as ReturnType<typeof getDbConnection> extends Promise<infer T> ? T : never);

    const result = await storePdfSummaryAction({
      fileUrl: "https://example.com/file.pdf",
      summary: "Test summary",
      title: "Test Title",
      fileName: "file.pdf"
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Query failed");
  });
});
