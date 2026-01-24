import { describe, it, expect } from "vitest";
import { formatFileNameAsTitle } from "@/utils/format-utils";

describe("formatFileNameAsTitle", () => {
  it("should remove file extension", () => {
    expect(formatFileNameAsTitle("document.pdf")).toBe("Document");
    expect(formatFileNameAsTitle("report.docx")).toBe("Report");
  });

  it("should replace dashes with spaces", () => {
    expect(formatFileNameAsTitle("my-document.pdf")).toBe("My Document");
    expect(formatFileNameAsTitle("file-name-here.txt")).toBe("File Name Here");
  });

  it("should replace underscores with spaces", () => {
    expect(formatFileNameAsTitle("my_document.pdf")).toBe("My Document");
    expect(formatFileNameAsTitle("file_name_here.txt")).toBe("File Name Here");
  });

  it("should handle camelCase", () => {
    expect(formatFileNameAsTitle("myDocument.pdf")).toBe("My Document");
    expect(formatFileNameAsTitle("fileNameHere.txt")).toBe("File Name Here");
  });

  it("should convert to title case", () => {
    expect(formatFileNameAsTitle("UPPERCASE.pdf")).toBe("Uppercase");
    expect(formatFileNameAsTitle("lowercase.pdf")).toBe("Lowercase");
  });

  it("should handle multiple special characters", () => {
    expect(formatFileNameAsTitle("my--document__here.pdf")).toBe("My Document Here");
  });

  it("should handle files without extension", () => {
    expect(formatFileNameAsTitle("document")).toBe("Document");
  });

  it("should trim whitespace", () => {
    expect(formatFileNameAsTitle("  document  .pdf")).toBe("Document");
  });

  it("should handle empty string", () => {
    expect(formatFileNameAsTitle("")).toBe("");
  });

  it("should handle complex filenames", () => {
    expect(formatFileNameAsTitle("2024-Annual_ReportFinal.pdf")).toBe("2024 Annual Report Final");
  });
});
