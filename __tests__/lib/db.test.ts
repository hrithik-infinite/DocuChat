import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the @neondatabase/serverless module
vi.mock("@neondatabase/serverless", () => ({
  neon: vi.fn(),
}));

import { getDbConnection } from "@/lib/db";
import { neon } from "@neondatabase/serverless";

describe("getDbConnection", () => {
  const originalEnv = process.env;
  const mockSqlFunction = vi.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    // Create a fresh copy of process.env for each test
    process.env = { ...originalEnv };
    // Setup the mock to return a mock sql function
    vi.mocked(neon).mockReturnValue(mockSqlFunction);
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("successful connection", () => {
    it("should successfully get a db connection when DATABASE_URL is set", async () => {
      process.env.DATABASE_URL = "postgresql://user:password@host:5432/database";

      const result = await getDbConnection();

      expect(result).toBeDefined();
      expect(neon).toHaveBeenCalledTimes(1);
    });

    it("should call neon with the correct DATABASE_URL", async () => {
      const testUrl = "postgresql://testuser:testpass@testhost:5432/testdb";
      process.env.DATABASE_URL = testUrl;

      await getDbConnection();

      expect(neon).toHaveBeenCalledWith(testUrl);
    });

    it("should return the neon sql function", async () => {
      process.env.DATABASE_URL = "postgresql://user:password@host:5432/database";

      const result = await getDbConnection();

      expect(result).toBe(mockSqlFunction);
    });

    it("should handle different DATABASE_URL formats", async () => {
      const urls = [
        "postgresql://user:password@localhost:5432/mydb",
        "postgres://admin:secret@db.example.com:5432/production",
        "postgresql://user:pass@neon-pooler.region.aws.neon.tech/neondb?sslmode=require",
      ];

      for (const url of urls) {
        vi.clearAllMocks();
        process.env.DATABASE_URL = url;

        const result = await getDbConnection();

        expect(neon).toHaveBeenCalledWith(url);
        expect(result).toBe(mockSqlFunction);
      }
    });
  });

  describe("error handling", () => {
    it("should throw an error when DATABASE_URL is not set", async () => {
      delete process.env.DATABASE_URL;

      await expect(getDbConnection()).rejects.toThrow("Neon Database URL not dfined");
    });

    it("should throw an error when DATABASE_URL is undefined", async () => {
      process.env.DATABASE_URL = undefined;

      await expect(getDbConnection()).rejects.toThrow("Neon Database URL not dfined");
    });

    it("should throw an error when DATABASE_URL is an empty string", async () => {
      process.env.DATABASE_URL = "";

      await expect(getDbConnection()).rejects.toThrow("Neon Database URL not dfined");
    });

    it("should throw the correct error message", async () => {
      delete process.env.DATABASE_URL;

      try {
        await getDbConnection();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Neon Database URL not dfined");
      }
    });
  });

  describe("neon function behavior", () => {
    it("should only call neon once per getDbConnection call", async () => {
      process.env.DATABASE_URL = "postgresql://user:password@host:5432/database";

      await getDbConnection();

      expect(neon).toHaveBeenCalledTimes(1);
    });

    it("should call neon each time getDbConnection is called", async () => {
      process.env.DATABASE_URL = "postgresql://user:password@host:5432/database";

      await getDbConnection();
      await getDbConnection();
      await getDbConnection();

      expect(neon).toHaveBeenCalledTimes(3);
    });

    it("should return different sql functions if neon returns different values", async () => {
      process.env.DATABASE_URL = "postgresql://user:password@host:5432/database";

      const mockSqlFunction1 = vi.fn();
      const mockSqlFunction2 = vi.fn();

      vi.mocked(neon).mockReturnValueOnce(mockSqlFunction1);
      vi.mocked(neon).mockReturnValueOnce(mockSqlFunction2);

      const result1 = await getDbConnection();
      const result2 = await getDbConnection();

      expect(result1).toBe(mockSqlFunction1);
      expect(result2).toBe(mockSqlFunction2);
      expect(result1).not.toBe(result2);
    });
  });
});
