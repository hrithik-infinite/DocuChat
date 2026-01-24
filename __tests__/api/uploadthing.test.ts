import { describe, it, expect, vi, beforeEach } from "vitest";

// Store the middleware and onUploadComplete functions for testing
let capturedMiddleware: (() => Promise<{ userId: string }>) | null = null;
let capturedOnUploadComplete: ((args: { metadata: { userId: string }; file: { name: string; ufsUrl: string } }) => Promise<{ userId: string; name: string; url: string }>) | null = null;

// Mock the modules before importing the file
vi.mock("uploadthing/next", () => ({
  createUploadthing: vi.fn(() => {
    const f = (config: unknown) => ({
      middleware: (fn: (args: { req: unknown }) => Promise<{ userId: string }>) => {
        capturedMiddleware = fn as unknown as () => Promise<{ userId: string }>;
        return {
          onUploadComplete: (completeFn: (args: { metadata: { userId: string }; file: { name: string; ufsUrl: string } }) => Promise<{ userId: string; name: string; url: string }>) => {
            capturedOnUploadComplete = completeFn;
            return {
              config,
              middlewareFn: fn,
              completeFn
            };
          }
        };
      }
    });
    return f;
  })
}));

vi.mock("uploadthing/server", () => ({
  UploadThingError: class UploadThingError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "UploadThingError";
    }
  }
}));

vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn()
}));

import { currentUser } from "@clerk/nextjs/server";
import { UploadThingError } from "uploadthing/server";

describe("uploadthing core", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedMiddleware = null;
    capturedOnUploadComplete = null;
    vi.resetModules();
  });

  describe("pdfUploader middleware", () => {
    it("should throw UploadThingError when user is not authenticated", async () => {
      vi.mocked(currentUser).mockResolvedValue(null);

      // Import the module to capture the middleware
      await import("@/app/api/uploadthing/core");

      expect(capturedMiddleware).toBeDefined();

      // Execute the middleware and expect it to throw
      await expect(capturedMiddleware!()).rejects.toThrow(UploadThingError);
      await expect(capturedMiddleware!()).rejects.toThrow("Unauthorized");
    });

    it("should return userId when user is authenticated", async () => {
      vi.mocked(currentUser).mockResolvedValue({
        id: "user_123",
        firstName: "Test",
        lastName: "User",
        emailAddresses: []
      } as unknown as Awaited<ReturnType<typeof currentUser>>);

      await import("@/app/api/uploadthing/core");

      expect(capturedMiddleware).toBeDefined();

      const result = await capturedMiddleware!();
      expect(result).toEqual({ userId: "user_123" });
    });

    it("should call currentUser to check authentication", async () => {
      vi.mocked(currentUser).mockResolvedValue({
        id: "user_456"
      } as unknown as Awaited<ReturnType<typeof currentUser>>);

      await import("@/app/api/uploadthing/core");
      await capturedMiddleware!();

      expect(currentUser).toHaveBeenCalled();
    });
  });

  describe("pdfUploader onUploadComplete", () => {
    it("should return userId, name, and url on upload complete", async () => {
      vi.mocked(currentUser).mockResolvedValue({
        id: "user_789"
      } as unknown as Awaited<ReturnType<typeof currentUser>>);

      await import("@/app/api/uploadthing/core");

      expect(capturedOnUploadComplete).toBeDefined();

      const result = await capturedOnUploadComplete!({
        metadata: { userId: "user_789" },
        file: { name: "test.pdf", ufsUrl: "https://example.com/test.pdf" }
      });

      expect(result).toEqual({
        userId: "user_789",
        name: "test.pdf",
        url: "https://example.com/test.pdf"
      });
    });

    it("should use metadata userId from middleware", async () => {
      vi.mocked(currentUser).mockResolvedValue({
        id: "user_abc"
      } as unknown as Awaited<ReturnType<typeof currentUser>>);

      await import("@/app/api/uploadthing/core");

      const result = await capturedOnUploadComplete!({
        metadata: { userId: "user_abc" },
        file: { name: "document.pdf", ufsUrl: "https://cdn.example.com/document.pdf" }
      });

      expect(result.userId).toBe("user_abc");
    });

    it("should extract file name from file object", async () => {
      vi.mocked(currentUser).mockResolvedValue({
        id: "user_xyz"
      } as unknown as Awaited<ReturnType<typeof currentUser>>);

      await import("@/app/api/uploadthing/core");

      const result = await capturedOnUploadComplete!({
        metadata: { userId: "user_xyz" },
        file: { name: "my-report.pdf", ufsUrl: "https://storage.example.com/my-report.pdf" }
      });

      expect(result.name).toBe("my-report.pdf");
    });

    it("should extract url from file.ufsUrl", async () => {
      vi.mocked(currentUser).mockResolvedValue({
        id: "user_test"
      } as unknown as Awaited<ReturnType<typeof currentUser>>);

      await import("@/app/api/uploadthing/core");

      const result = await capturedOnUploadComplete!({
        metadata: { userId: "user_test" },
        file: { name: "file.pdf", ufsUrl: "https://ufs.uploadthing.com/f/abc123" }
      });

      expect(result.url).toBe("https://ufs.uploadthing.com/f/abc123");
    });

    it("should log upload completion", async () => {
      vi.spyOn(console, "log").mockImplementation(() => {});
      vi.mocked(currentUser).mockResolvedValue({
        id: "user_log"
      } as unknown as Awaited<ReturnType<typeof currentUser>>);

      await import("@/app/api/uploadthing/core");

      await capturedOnUploadComplete!({
        metadata: { userId: "user_log" },
        file: { name: "log-test.pdf", ufsUrl: "https://example.com/log-test.pdf" }
      });

      expect(console.log).toHaveBeenCalledWith("upload completed for user id");
    });
  });

  describe("file router configuration", () => {
    it("should export ourFileRouter", async () => {
      const module = await import("@/app/api/uploadthing/core");
      expect(module.ourFileRouter).toBeDefined();
      expect(module.ourFileRouter.pdfUploader).toBeDefined();
    });

    it("should export OurFileRouter type", async () => {
      const module = await import("@/app/api/uploadthing/core");
      expect(module).toHaveProperty("ourFileRouter");
    });

    it("should configure pdfUploader with correct settings", async () => {
      await import("@/app/api/uploadthing/core");

      // The middleware and onUploadComplete should have been captured
      expect(capturedMiddleware).toBeDefined();
      expect(capturedOnUploadComplete).toBeDefined();
    });
  });
});
