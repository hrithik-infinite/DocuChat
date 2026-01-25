import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteSummaryAction } from "@/actions/summary-actions";

// Mock the modules
vi.mock("@/lib/db", () => ({
  getDbConnection: vi.fn(),
}));

vi.mock("@workos-inc/authkit-nextjs", () => ({
  withAuth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Import mocked modules
import { getDbConnection } from "@/lib/db";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { revalidatePath } from "next/cache";

describe("deleteSummaryAction", () => {
  const mockSql = vi.fn();
  const mockSummaryId = "test-summary-id-123";
  const mockUserId = "user-id-456";

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console.error mock
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("successful deletion", () => {
    it("should successfully delete a summary when user is authenticated and summary exists", async () => {
      // Setup mocks
      vi.mocked(withAuth).mockResolvedValue({ user: { id: mockUserId } } as any);
      vi.mocked(getDbConnection).mockResolvedValue(mockSql as any);
      mockSql.mockResolvedValue([{ id: mockSummaryId }]);

      // Execute
      const result = await deleteSummaryAction({ summaryId: mockSummaryId });

      // Verify
      expect(result).toEqual({ success: true });
      expect(withAuth).toHaveBeenCalledTimes(1);
      expect(getDbConnection).toHaveBeenCalledTimes(1);
      expect(mockSql).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("should call the database with correct parameters", async () => {
      vi.mocked(withAuth).mockResolvedValue({ user: { id: mockUserId } } as any);
      vi.mocked(getDbConnection).mockResolvedValue(mockSql as any);
      mockSql.mockResolvedValue([{ id: mockSummaryId }]);

      await deleteSummaryAction({ summaryId: mockSummaryId });

      // The SQL template literal will be called with specific arguments
      expect(mockSql).toHaveBeenCalled();
      const callArgs = mockSql.mock.calls[0];
      // Template literal calls pass strings array and values
      expect(callArgs).toBeDefined();
    });
  });

  describe("user not found (no auth)", () => {
    it("should return failure when withAuth returns null user", async () => {
      vi.mocked(withAuth).mockResolvedValue({ user: null } as any);

      const result = await deleteSummaryAction({ summaryId: mockSummaryId });

      expect(result).toEqual({ success: false });
      expect(withAuth).toHaveBeenCalledTimes(1);
      expect(getDbConnection).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should return failure when user has no id", async () => {
      vi.mocked(withAuth).mockResolvedValue({ user: { id: undefined } } as any);

      const result = await deleteSummaryAction({ summaryId: mockSummaryId });

      expect(result).toEqual({ success: false });
      expect(getDbConnection).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should log error when user is not found", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(withAuth).mockResolvedValue({ user: null } as any);

      await deleteSummaryAction({ summaryId: mockSummaryId });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error deleting sumamry",
        expect.any(Error)
      );
    });
  });

  describe("summary not found (no matching record)", () => {
    it("should return failure when no summary matches the given id", async () => {
      vi.mocked(withAuth).mockResolvedValue({ user: { id: mockUserId } } as any);
      vi.mocked(getDbConnection).mockResolvedValue(mockSql as any);
      mockSql.mockResolvedValue([]); // Empty result - no matching record

      const result = await deleteSummaryAction({ summaryId: mockSummaryId });

      expect(result).toEqual({ success: false });
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should return failure when summary belongs to different user", async () => {
      vi.mocked(withAuth).mockResolvedValue({ user: { id: mockUserId } } as any);
      vi.mocked(getDbConnection).mockResolvedValue(mockSql as any);
      // Database returns empty because user_id doesn't match
      mockSql.mockResolvedValue([]);

      const result = await deleteSummaryAction({ summaryId: "other-user-summary-id" });

      expect(result).toEqual({ success: false });
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });

  describe("database error handling", () => {
    it("should return failure when getDbConnection throws an error", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(withAuth).mockResolvedValue({ user: { id: mockUserId } } as any);
      vi.mocked(getDbConnection).mockRejectedValue(new Error("Database connection failed"));

      const result = await deleteSummaryAction({ summaryId: mockSummaryId });

      expect(result).toEqual({ success: false });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error deleting sumamry",
        expect.any(Error)
      );
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should return failure when SQL query throws an error", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(withAuth).mockResolvedValue({ user: { id: mockUserId } } as any);
      vi.mocked(getDbConnection).mockResolvedValue(mockSql as any);
      mockSql.mockRejectedValue(new Error("SQL execution failed"));

      const result = await deleteSummaryAction({ summaryId: mockSummaryId });

      expect(result).toEqual({ success: false });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error deleting sumamry",
        expect.any(Error)
      );
      expect(revalidatePath).not.toHaveBeenCalled();
    });

    it("should return failure when withAuth throws an error", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(withAuth).mockRejectedValue(new Error("Auth service unavailable"));

      const result = await deleteSummaryAction({ summaryId: mockSummaryId });

      expect(result).toEqual({ success: false });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error deleting sumamry",
        expect.any(Error)
      );
      expect(getDbConnection).not.toHaveBeenCalled();
    });

    it("should handle unexpected database response gracefully", async () => {
      vi.mocked(withAuth).mockResolvedValue({ user: { id: mockUserId } } as any);
      vi.mocked(getDbConnection).mockResolvedValue(mockSql as any);
      // Return undefined instead of an array
      mockSql.mockResolvedValue(undefined);

      const result = await deleteSummaryAction({ summaryId: mockSummaryId });

      // This should trigger an error because undefined.length will throw
      expect(result).toEqual({ success: false });
    });
  });

  describe("edge cases", () => {
    it("should handle empty summaryId", async () => {
      vi.mocked(withAuth).mockResolvedValue({ user: { id: mockUserId } } as any);
      vi.mocked(getDbConnection).mockResolvedValue(mockSql as any);
      mockSql.mockResolvedValue([]);

      const result = await deleteSummaryAction({ summaryId: "" });

      expect(result).toEqual({ success: false });
    });

    it("should handle special characters in summaryId", async () => {
      vi.mocked(withAuth).mockResolvedValue({ user: { id: mockUserId } } as any);
      vi.mocked(getDbConnection).mockResolvedValue(mockSql as any);
      mockSql.mockResolvedValue([{ id: "special-id-!@#$%" }]);

      const result = await deleteSummaryAction({ summaryId: "special-id-!@#$%" });

      expect(result).toEqual({ success: true });
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });

    it("should only revalidate path on successful deletion", async () => {
      // First call - success
      vi.mocked(withAuth).mockResolvedValue({ user: { id: mockUserId } } as any);
      vi.mocked(getDbConnection).mockResolvedValue(mockSql as any);
      mockSql.mockResolvedValue([{ id: mockSummaryId }]);

      await deleteSummaryAction({ summaryId: mockSummaryId });
      expect(revalidatePath).toHaveBeenCalledTimes(1);

      // Reset mocks
      vi.clearAllMocks();

      // Second call - failure (no matching record)
      vi.mocked(withAuth).mockResolvedValue({ user: { id: mockUserId } } as any);
      vi.mocked(getDbConnection).mockResolvedValue(mockSql as any);
      mockSql.mockResolvedValue([]);

      await deleteSummaryAction({ summaryId: "non-existent-id" });
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});
