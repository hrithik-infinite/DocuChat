import { describe, it, expect } from "vitest";
import { cn, formatFileName } from "@/lib/utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar");
  });

  it("should handle undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("should merge tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle arrays", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("should handle objects", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("should handle empty input", () => {
    expect(cn()).toBe("");
  });

  it("should handle complex tailwind merging", () => {
    expect(cn("bg-red-500 hover:bg-red-600", "bg-blue-500")).toBe("hover:bg-red-600 bg-blue-500");
  });
});

describe("formatFileName", () => {
  it("should extract filename from URL and format it", () => {
    expect(formatFileName("https://example.com/files/my-document.pdf")).toBe("My Document");
  });

  it("should replace underscores with spaces", () => {
    expect(formatFileName("https://example.com/files/my_document.pdf")).toBe("My Document");
  });

  it("should replace dashes with spaces", () => {
    expect(formatFileName("https://example.com/files/my-document.pdf")).toBe("My Document");
  });

  it("should convert to title case", () => {
    expect(formatFileName("https://example.com/files/UPPERCASE.pdf")).toBe("Uppercase");
  });

  it("should handle URLs without path", () => {
    expect(formatFileName("")).toBe("");
  });

  it("should handle simple filenames", () => {
    expect(formatFileName("document.pdf")).toBe("Document");
  });

  it("should handle complex URLs", () => {
    expect(formatFileName("https://example.com/path/to/files/annual-report_2024.pdf")).toBe("Annual Report 2024");
  });

  it("should handle URLs with query parameters", () => {
    const result = formatFileName("https://example.com/files/document.pdf?query=value");
    expect(result).toContain("Document");
  });
});
