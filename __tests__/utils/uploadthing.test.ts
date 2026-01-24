import { describe, it, expect, vi } from "vitest";

// Mock the uploadthing react helpers
const mockUseUploadThing = vi.fn();

vi.mock("@uploadthing/react", () => ({
  generateReactHelpers: vi.fn(() => ({
    useUploadThing: mockUseUploadThing
  }))
}));

// Mock the file router type
vi.mock("@/app/api/uploadthing/core", () => ({
  ourFileRouter: {}
}));

import { generateReactHelpers } from "@uploadthing/react";

describe("uploadthing utils", () => {
  it("should export useUploadThing hook", async () => {
    const module = await import("@/utils/uploadthing");

    expect(module.useUploadThing).toBeDefined();
  });

  it("should call generateReactHelpers to create hooks", async () => {
    await import("@/utils/uploadthing");

    expect(generateReactHelpers).toHaveBeenCalled();
  });

  it("should export a function for useUploadThing", async () => {
    const module = await import("@/utils/uploadthing");

    expect(typeof module.useUploadThing).toBe("function");
  });
});
