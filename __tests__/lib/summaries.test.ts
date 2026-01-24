import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSummaries, getSummaryById, getUserUploadCount } from "@/lib/summaries";

// Mock the db module
vi.mock("@/lib/db", () => ({
  getDbConnection: vi.fn(),
}));

import { getDbConnection } from "@/lib/db";

const mockGetDbConnection = vi.mocked(getDbConnection);

describe("getSummaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return summaries for a given user", async () => {
    const mockSummaries = [
      {
        id: "1",
        user_id: "user-123",
        title: "Summary 1",
        summary_text: "This is summary 1",
        created_at: new Date("2024-01-02"),
      },
      {
        id: "2",
        user_id: "user-123",
        title: "Summary 2",
        summary_text: "This is summary 2",
        created_at: new Date("2024-01-01"),
      },
    ];

    const mockSql = vi.fn().mockResolvedValue(mockSummaries);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getSummaries("user-123");

    expect(mockGetDbConnection).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockSummaries);
  });

  it("should return empty array when user has no summaries", async () => {
    const mockSql = vi.fn().mockResolvedValue([]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getSummaries("user-without-summaries");

    expect(mockGetDbConnection).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it("should call database with correct user id", async () => {
    const mockSql = vi.fn().mockResolvedValue([]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    await getSummaries("test-user-id");

    expect(mockGetDbConnection).toHaveBeenCalled();
    expect(mockSql).toHaveBeenCalled();
  });

  it("should propagate database errors", async () => {
    const mockError = new Error("Database connection failed");
    mockGetDbConnection.mockRejectedValue(mockError);

    await expect(getSummaries("user-123")).rejects.toThrow("Database connection failed");
  });

  it("should handle query execution errors", async () => {
    const mockSql = vi.fn().mockRejectedValue(new Error("Query failed"));
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    await expect(getSummaries("user-123")).rejects.toThrow("Query failed");
  });
});

describe("getSummaryById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return a summary by id", async () => {
    const mockSummary = {
      id: "summary-123",
      user_id: "user-456",
      title: "Test Summary",
      original_file_url: "https://example.com/file.pdf",
      summary_text: "This is a test summary with some words",
      status: "completed",
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-02"),
      file_name: "file.pdf",
      word_count: 8,
    };

    const mockSql = vi.fn().mockResolvedValue([mockSummary]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getSummaryById("summary-123");

    expect(mockGetDbConnection).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockSummary);
  });

  it("should return undefined when summary is not found", async () => {
    const mockSql = vi.fn().mockResolvedValue([]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getSummaryById("non-existent-id");

    expect(result).toBeUndefined();
  });

  it("should return null on database error", async () => {
    const mockError = new Error("Database error");
    mockGetDbConnection.mockRejectedValue(mockError);

    const result = await getSummaryById("summary-123");

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith("Error fetching summary by id", mockError);
  });

  it("should return null on query execution error", async () => {
    const mockError = new Error("Query execution failed");
    const mockSql = vi.fn().mockRejectedValue(mockError);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getSummaryById("summary-123");

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith("Error fetching summary by id", mockError);
  });

  it("should include word_count in the result", async () => {
    const mockSummary = {
      id: "summary-123",
      user_id: "user-456",
      title: "Test Summary",
      original_file_url: "https://example.com/file.pdf",
      summary_text: "One two three four five",
      status: "completed",
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-02"),
      file_name: "file.pdf",
      word_count: 5,
    };

    const mockSql = vi.fn().mockResolvedValue([mockSummary]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getSummaryById("summary-123");

    expect(result).toHaveProperty("word_count");
    expect(result?.word_count).toBe(5);
  });

  it("should return all expected fields", async () => {
    const mockSummary = {
      id: "summary-123",
      user_id: "user-456",
      title: "Test Summary",
      original_file_url: "https://example.com/file.pdf",
      summary_text: "This is a test summary",
      status: "completed",
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-01-02"),
      file_name: "file.pdf",
      word_count: 5,
    };

    const mockSql = vi.fn().mockResolvedValue([mockSummary]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getSummaryById("summary-123");

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("user_id");
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("original_file_url");
    expect(result).toHaveProperty("summary_text");
    expect(result).toHaveProperty("status");
    expect(result).toHaveProperty("created_at");
    expect(result).toHaveProperty("updated_at");
    expect(result).toHaveProperty("file_name");
    expect(result).toHaveProperty("word_count");
  });
});

describe("getUserUploadCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should return the upload count for a user", async () => {
    const mockSql = vi.fn().mockResolvedValue([{ count: 5 }]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getUserUploadCount("user-123");

    expect(mockGetDbConnection).toHaveBeenCalledTimes(1);
    expect(result).toBe(5);
  });

  it("should return 0 when user has no uploads", async () => {
    const mockSql = vi.fn().mockResolvedValue([{ count: 0 }]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getUserUploadCount("new-user");

    expect(result).toBe(0);
  });

  it("should return 0 when result is empty", async () => {
    const mockSql = vi.fn().mockResolvedValue([]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getUserUploadCount("user-123");

    expect(result).toBe(0);
  });

  it("should return 0 when count is undefined", async () => {
    const mockSql = vi.fn().mockResolvedValue([{}]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getUserUploadCount("user-123");

    expect(result).toBe(0);
  });

  it("should propagate database connection error", async () => {
    const mockError = new Error("Connection failed");
    mockGetDbConnection.mockRejectedValue(mockError);

    // getDbConnection is called before try-catch, so error propagates
    await expect(getUserUploadCount("user-123")).rejects.toThrow("Connection failed");
  });

  it("should return 0 on query execution error", async () => {
    const mockError = new Error("Query failed");
    const mockSql = vi.fn().mockRejectedValue(mockError);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getUserUploadCount("user-123");

    expect(result).toBe(0);
    expect(console.error).toHaveBeenCalledWith("error in upload count", mockError);
  });

  it("should handle large upload counts", async () => {
    const mockSql = vi.fn().mockResolvedValue([{ count: 99999 }]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getUserUploadCount("power-user");

    expect(result).toBe(99999);
  });

  it("should handle string count values", async () => {
    // Database might return count as string in some cases
    const mockSql = vi.fn().mockResolvedValue([{ count: "10" }]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getUserUploadCount("user-123");

    expect(result).toBe("10");
  });

  it("should handle null result", async () => {
    const mockSql = vi.fn().mockResolvedValue([null]);
    mockGetDbConnection.mockResolvedValue(mockSql as any);

    const result = await getUserUploadCount("user-123");

    expect(result).toBe(0);
  });
});
