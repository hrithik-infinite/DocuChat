import { describe, it, expect, vi, beforeEach } from "vitest";

// Store mock load function to control behavior in tests
const mockLoad = vi.fn();

// Mock the PDFLoader from langchain community using a class
vi.mock("@langchain/community/document_loaders/fs/pdf", () => {
  return {
    PDFLoader: class MockPDFLoader {
      constructor(public blob: Blob) {}
      load = mockLoad;
    },
  };
});

import { fetchAndExtractPdfText } from "@/lib/langchain";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

describe("fetchAndExtractPdfText", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoad.mockReset();
  });

  it("should successfully fetch and extract PDF text from a single page", async () => {
    const mockPdfContent = "This is the content of page 1";
    const mockArrayBuffer = new ArrayBuffer(8);

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      blob: vi.fn().mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      }),
    });

    // Mock PDFLoader load to return single page document
    mockLoad.mockResolvedValue([{ pageContent: mockPdfContent }]);

    const result = await fetchAndExtractPdfText("https://example.com/test.pdf");

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/test.pdf");
    expect(mockLoad).toHaveBeenCalled();
    expect(result).toBe(mockPdfContent);
  });

  it("should handle multiple pages and return all content", async () => {
    const page1Content = "Content from page 1";
    const page2Content = "Content from page 2";
    const page3Content = "Content from page 3";
    const mockArrayBuffer = new ArrayBuffer(8);

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      blob: vi.fn().mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      }),
    });

    // Mock PDFLoader load to return multiple page documents
    mockLoad.mockResolvedValue([
      { pageContent: page1Content },
      { pageContent: page2Content },
      { pageContent: page3Content },
    ]);

    const result = await fetchAndExtractPdfText("https://example.com/multipage.pdf");

    expect(result).toContain(page1Content);
    expect(result).toContain(page2Content);
    expect(result).toContain(page3Content);
  });

  it("should combine multiple pages with newlines", async () => {
    const page1Content = "First page content";
    const page2Content = "Second page content";
    const mockArrayBuffer = new ArrayBuffer(8);

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      blob: vi.fn().mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      }),
    });

    // Mock PDFLoader load to return two pages
    mockLoad.mockResolvedValue([
      { pageContent: page1Content },
      { pageContent: page2Content },
    ]);

    const result = await fetchAndExtractPdfText("https://example.com/test.pdf");

    // Verify pages are joined with newline separator
    expect(result).toBe(`${page1Content}\n${page2Content}`);
  });

  it("should return empty string for PDF with no content", async () => {
    const mockArrayBuffer = new ArrayBuffer(8);

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      blob: vi.fn().mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      }),
    });

    // Mock PDFLoader load to return empty array
    mockLoad.mockResolvedValue([]);

    const result = await fetchAndExtractPdfText("https://example.com/empty.pdf");

    expect(result).toBe("");
  });
});
