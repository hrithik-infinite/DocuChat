import { describe, it, expect, vi, beforeEach } from "vitest";

// Define the pro priceId constant for testing
const PRO_PRICE_ID = "price_pro_test";

// Mock the db module
vi.mock("@/lib/db", () => ({
  getDbConnection: vi.fn()
}));

// Mock the summaries module
vi.mock("@/lib/summaries", () => ({
  getUserUploadCount: vi.fn()
}));

// Mock the constants module with a consistent priceId for testing
vi.mock("@/utils/contants", () => ({
  plans: [
    {
      id: "basic",
      name: "Free",
      description: "For occasional users",
      paymentLink: "http://localhost:3000/upload",
      priceId: "free",
      price: 0,
      items: ["5 PDF summaries per month", "Standard processing speed", "Email support"]
    },
    {
      id: "pro",
      name: "Pro",
      description: "For professionals and teams",
      paymentLink: "https://buy.stripe.com/test",
      priceId: "price_pro_test",
      price: 299,
      items: ["Unlimited PDF summaries", "Priority processing", "24/7 priority support", "Markdown export"]
    }
  ]
}));

// Import the functions after mocks are set up
import { getPriceId, hasReachedUploadLimit } from "@/utils/user";

// Import the mocked modules
import { getDbConnection } from "@/lib/db";
import { getUserUploadCount } from "@/lib/summaries";

// Type the mocked functions
const mockGetDbConnection = vi.mocked(getDbConnection);
const mockGetUserUploadCount = vi.mocked(getUserUploadCount);

describe("getPriceId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return price_id when user exists with active status", async () => {
    const mockSql = vi.fn().mockResolvedValue([{ price_id: "price_123" }]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getPriceId("test@example.com");

    expect(result).toBe("price_123");
    expect(mockGetDbConnection).toHaveBeenCalledTimes(1);
  });

  it("should return null when user is not found", async () => {
    const mockSql = vi.fn().mockResolvedValue([]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getPriceId("nonexistent@example.com");

    expect(result).toBeNull();
  });

  it("should return null when query returns undefined", async () => {
    const mockSql = vi.fn().mockResolvedValue(undefined);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getPriceId("test@example.com");

    expect(result).toBeNull();
  });

  it("should return null when price_id is undefined in result", async () => {
    const mockSql = vi.fn().mockResolvedValue([{ price_id: undefined }]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getPriceId("test@example.com");

    expect(result).toBeNull();
  });

  it("should return null when price_id is null in result", async () => {
    const mockSql = vi.fn().mockResolvedValue([{ price_id: null }]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getPriceId("test@example.com");

    expect(result).toBeNull();
  });

  it("should return the first price_id when multiple results exist", async () => {
    const mockSql = vi.fn().mockResolvedValue([
      { price_id: "price_first" },
      { price_id: "price_second" }
    ]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getPriceId("test@example.com");

    expect(result).toBe("price_first");
  });
});

describe("hasReachedUploadLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("free user (limit 5)", () => {
    it("should return hasReachedLimit: false when upload count is 0", async () => {
      mockGetUserUploadCount.mockResolvedValue(0);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: "free" }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("user123");

      expect(result).toEqual({
        hasReachedLimit: false,
        uploadLimit: 5
      });
    });

    it("should return hasReachedLimit: false when upload count is 4", async () => {
      mockGetUserUploadCount.mockResolvedValue(4);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: "free" }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("user123");

      expect(result).toEqual({
        hasReachedLimit: false,
        uploadLimit: 5
      });
    });

    it("should return hasReachedLimit: true when upload count equals limit (5)", async () => {
      mockGetUserUploadCount.mockResolvedValue(5);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: "free" }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("user123");

      expect(result).toEqual({
        hasReachedLimit: true,
        uploadLimit: 5
      });
    });

    it("should return hasReachedLimit: true when upload count exceeds limit (6)", async () => {
      mockGetUserUploadCount.mockResolvedValue(6);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: "free" }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("user123");

      expect(result).toEqual({
        hasReachedLimit: true,
        uploadLimit: 5
      });
    });

    it("should treat user with no price_id as free user", async () => {
      mockGetUserUploadCount.mockResolvedValue(5);
      const mockSql = vi.fn().mockResolvedValue([]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("user123");

      expect(result).toEqual({
        hasReachedLimit: true,
        uploadLimit: 5
      });
    });

    it("should treat user with unknown price_id as free user", async () => {
      mockGetUserUploadCount.mockResolvedValue(5);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: "unknown_price" }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("user123");

      expect(result).toEqual({
        hasReachedLimit: true,
        uploadLimit: 5
      });
    });
  });

  describe("pro user (limit 100)", () => {
    it("should return hasReachedLimit: false when upload count is 0", async () => {
      mockGetUserUploadCount.mockResolvedValue(0);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: PRO_PRICE_ID }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("prouser123");

      expect(result).toEqual({
        hasReachedLimit: false,
        uploadLimit: 100
      });
    });

    it("should return hasReachedLimit: false when upload count is 99", async () => {
      mockGetUserUploadCount.mockResolvedValue(99);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: PRO_PRICE_ID }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("prouser123");

      expect(result).toEqual({
        hasReachedLimit: false,
        uploadLimit: 100
      });
    });

    it("should return hasReachedLimit: true when upload count equals limit (100)", async () => {
      mockGetUserUploadCount.mockResolvedValue(100);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: PRO_PRICE_ID }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("prouser123");

      expect(result).toEqual({
        hasReachedLimit: true,
        uploadLimit: 100
      });
    });

    it("should return hasReachedLimit: true when upload count exceeds limit (150)", async () => {
      mockGetUserUploadCount.mockResolvedValue(150);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: PRO_PRICE_ID }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("prouser123");

      expect(result).toEqual({
        hasReachedLimit: true,
        uploadLimit: 100
      });
    });

    it("should handle mid-range upload counts for pro user (50)", async () => {
      mockGetUserUploadCount.mockResolvedValue(50);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: PRO_PRICE_ID }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("prouser123");

      expect(result).toEqual({
        hasReachedLimit: false,
        uploadLimit: 100
      });
    });

    it("should handle high upload counts below limit for pro user (75)", async () => {
      mockGetUserUploadCount.mockResolvedValue(75);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: PRO_PRICE_ID }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("prouser123");

      expect(result).toEqual({
        hasReachedLimit: false,
        uploadLimit: 100
      });
    });
  });

  describe("edge cases", () => {
    it("should call getUserUploadCount with the correct userId", async () => {
      mockGetUserUploadCount.mockResolvedValue(0);
      const mockSql = vi.fn().mockResolvedValue([]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      await hasReachedUploadLimit("specific-user-id");

      expect(mockGetUserUploadCount).toHaveBeenCalledWith("specific-user-id");
    });

    it("should call getPriceId (via getDbConnection) with the userId", async () => {
      mockGetUserUploadCount.mockResolvedValue(0);
      const mockSql = vi.fn().mockResolvedValue([]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      await hasReachedUploadLimit("another-user-id");

      expect(mockGetDbConnection).toHaveBeenCalled();
    });

    it("should handle boundary case: free user at exactly limit-1 (4)", async () => {
      mockGetUserUploadCount.mockResolvedValue(4);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: "free" }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("user123");

      expect(result.hasReachedLimit).toBe(false);
      expect(result.uploadLimit).toBe(5);
    });

    it("should handle boundary case: pro user at exactly limit-1 (99)", async () => {
      mockGetUserUploadCount.mockResolvedValue(99);
      const mockSql = vi.fn().mockResolvedValue([{ price_id: PRO_PRICE_ID }]);
      mockGetDbConnection.mockResolvedValue(mockSql as any);

      const result = await hasReachedUploadLimit("prouser123");

      expect(result.hasReachedLimit).toBe(false);
      expect(result.uploadLimit).toBe(100);
    });
  });
});
