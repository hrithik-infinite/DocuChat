import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the core module first
vi.mock("@/app/api/uploadthing/core", () => ({
  ourFileRouter: {
    pdfUploader: {}
  }
}));

// Mock createRouteHandler with a factory that returns mock functions
vi.mock("uploadthing/next", () => ({
  createRouteHandler: vi.fn(() => ({
    GET: vi.fn(),
    POST: vi.fn()
  })),
  createUploadthing: vi.fn()
}));

describe("uploadthing route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should export GET handler", async () => {
    const routeModule = await import("@/app/api/uploadthing/route");
    expect(routeModule.GET).toBeDefined();
    expect(typeof routeModule.GET).toBe("function");
  });

  it("should export POST handler", async () => {
    const routeModule = await import("@/app/api/uploadthing/route");
    expect(routeModule.POST).toBeDefined();
    expect(typeof routeModule.POST).toBe("function");
  });

  it("should export both GET and POST handlers from createRouteHandler", async () => {
    const routeModule = await import("@/app/api/uploadthing/route");
    expect(routeModule).toHaveProperty("GET");
    expect(routeModule).toHaveProperty("POST");
  });
});
