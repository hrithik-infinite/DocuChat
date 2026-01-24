import { describe, it, expect } from "vitest";
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";

describe("SUMMARY_SYSTEM_PROMPT", () => {
  it("should be a non-empty string", () => {
    expect(typeof SUMMARY_SYSTEM_PROMPT).toBe("string");
    expect(SUMMARY_SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });

  it("should contain key formatting instructions", () => {
    expect(SUMMARY_SYSTEM_PROMPT).toContain("markdown");
    expect(SUMMARY_SYSTEM_PROMPT).toContain("emoji");
  });

  it("should contain section headers", () => {
    expect(SUMMARY_SYSTEM_PROMPT).toContain("# Key Highlights");
    expect(SUMMARY_SYSTEM_PROMPT).toContain("# Why It Matters");
    expect(SUMMARY_SYSTEM_PROMPT).toContain("# Main Points");
    expect(SUMMARY_SYSTEM_PROMPT).toContain("# Pro Tips");
    expect(SUMMARY_SYSTEM_PROMPT).toContain("# Bottom Line");
  });

  it("should include bullet point formatting instructions", () => {
    expect(SUMMARY_SYSTEM_PROMPT).toContain("• ");
  });

  it("should include document details section", () => {
    expect(SUMMARY_SYSTEM_PROMPT).toContain("# Document Details");
    expect(SUMMARY_SYSTEM_PROMPT).toContain("Type:");
    expect(SUMMARY_SYSTEM_PROMPT).toContain("For:");
  });

  it("should include key terms section", () => {
    expect(SUMMARY_SYSTEM_PROMPT).toContain("# Key Terms to Know");
  });
});
