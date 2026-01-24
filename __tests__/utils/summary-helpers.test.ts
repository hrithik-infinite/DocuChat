import { describe, it, expect } from "vitest";
import { parseSection, parsePoint, parseEmojiPoint } from "@/utils/summary-helpers";

describe("parseSection", () => {
  it("should parse section with hash title", () => {
    const section = "# My Title\n• First point\n• Second point";
    const result = parseSection(section);
    expect(result.title).toBe("My Title");
    expect(result.points).toEqual(["• First point", "• Second point"]);
  });

  it("should parse section without hash title", () => {
    const section = "Plain Title\n• First point";
    const result = parseSection(section);
    expect(result.title).toBe("Plain Title");
    expect(result.points).toEqual(["• First point"]);
  });

  it("should handle multiline points", () => {
    const section = "# Title\n• First point\ncontinued on next line\n• Second point";
    const result = parseSection(section);
    expect(result.points).toEqual(["• First point continued on next line", "• Second point"]);
  });

  it("should filter out lines starting with #", () => {
    const section = "# Title\n• First point\n# Sub heading\n• Second point";
    const result = parseSection(section);
    expect(result.points).not.toContain("# Sub heading");
  });

  it("should filter out lines starting with [Choose", () => {
    const section = "# Title\n• First point\n[Choose option]\n• Second point";
    const result = parseSection(section);
    expect(result.points).not.toContain("[Choose option]");
  });

  it("should handle empty lines between points", () => {
    const section = "# Title\n• First point\n\n• Second point";
    const result = parseSection(section);
    expect(result.points).toEqual(["• First point", "• Second point"]);
  });

  it("should handle section with only title", () => {
    const section = "# Title Only";
    const result = parseSection(section);
    expect(result.title).toBe("Title Only");
    expect(result.points).toEqual([]);
  });

  it("should handle empty section", () => {
    const section = "";
    const result = parseSection(section);
    expect(result.title).toBe("");
    expect(result.points).toEqual([]);
  });

  it("should handle multiple empty lines", () => {
    const section = "# Title\n\n\n• Point";
    const result = parseSection(section);
    expect(result.points).toEqual(["• Point"]);
  });
});

describe("parsePoint", () => {
  it("should detect numbered points", () => {
    expect(parsePoint("1. First item").isNumbered).toBe(true);
    expect(parsePoint("10. Tenth item").isNumbered).toBe(true);
    expect(parsePoint("123. Large number").isNumbered).toBe(true);
  });

  it("should detect main points with bullet", () => {
    expect(parsePoint("• Main point").isMainPoint).toBe(true);
    expect(parsePoint("• Another point").isMainPoint).toBe(true);
  });

  it("should detect emoji points", () => {
    expect(parsePoint("🎯 Target point").hasEmoji).toBe(true);
    expect(parsePoint("🚀 Launch").hasEmoji).toBe(true);
    // Only emojis in ranges U+1F300-U+1F9FF and U+2600-U+26FF are detected
    expect(parsePoint("☀ Sun").hasEmoji).toBe(true);
  });

  it("should detect empty points", () => {
    expect(parsePoint("").isEmpty).toBe(true);
    expect(parsePoint("   ").isEmpty).toBe(true);
    expect(parsePoint("\t").isEmpty).toBe(true);
  });

  it("should correctly classify non-special points", () => {
    const result = parsePoint("Regular text without special chars");
    expect(result.isNumbered).toBe(false);
    expect(result.isMainPoint).toBe(false);
    expect(result.isEmpty).toBe(false);
  });

  it("should handle combined formatting", () => {
    const result = parsePoint("• 🎯 Combined bullet and emoji");
    expect(result.isMainPoint).toBe(true);
    expect(result.hasEmoji).toBe(true);
  });
});

describe("parseEmojiPoint", () => {
  it("should extract emoji and text from point", () => {
    const result = parseEmojiPoint("• 🎯 Target point");
    expect(result.emoji).toBe("🎯");
    expect(result.text).toBe("Target point");
  });

  it("should handle points without bullet", () => {
    const result = parseEmojiPoint("🚀 Launch point");
    expect(result.emoji).toBe("🚀");
    expect(result.text).toBe("Launch point");
  });

  it("should return null for points without emoji", () => {
    const result = parseEmojiPoint("• No emoji here");
    expect(result.emoji).toBe(null);
    expect(result.text).toBe(null);
  });

  it("should handle multiple emojis", () => {
    const result = parseEmojiPoint("🎯🚀 Multiple emojis");
    expect(result.emoji).toBe("🎯🚀");
    expect(result.text).toBe("Multiple emojis");
  });

  it("should handle empty string", () => {
    const result = parseEmojiPoint("");
    expect(result.emoji).toBe(null);
    expect(result.text).toBe(null);
  });

  it("should handle only bullet point", () => {
    const result = parseEmojiPoint("•");
    expect(result.emoji).toBe(null);
    expect(result.text).toBe(null);
  });

  it("should trim whitespace from result", () => {
    const result = parseEmojiPoint("•   🎯   Some text   ");
    expect(result.emoji).toBe("🎯");
    expect(result.text).toBe("Some text");
  });
});
