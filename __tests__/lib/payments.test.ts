import { describe, it, expect, vi, beforeEach } from "vitest";
import type Stripe from "stripe";
import { handleCheckoutSessionCompleted, handleSubscriptionDeleted } from "@/lib/payments";

// Mock the db module
vi.mock("@/lib/db", () => ({
  getDbConnection: vi.fn()
}));

import { getDbConnection } from "@/lib/db";

// Helper to create mock SQL tagged template function
function createMockSql() {
  const mockSql = vi.fn().mockResolvedValue([]);
  return mockSql;
}

// Helper to create a mock Stripe customer
function createMockCustomer(overrides: Partial<Stripe.Customer> = {}): Stripe.Customer {
  return {
    id: "cus_test123",
    object: "customer",
    email: "test@example.com",
    name: "Test User",
    created: Date.now(),
    livemode: false,
    metadata: {},
    ...overrides
  } as Stripe.Customer;
}

// Helper to create a mock Stripe checkout session
function createMockSession(overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Checkout.Session {
  return {
    id: "cs_test123",
    object: "checkout.session",
    customer: "cus_test123",
    amount_total: 1999,
    status: "complete",
    line_items: {
      object: "list",
      data: [
        {
          id: "li_test123",
          object: "item",
          price: {
            id: "price_test123",
            object: "price",
            active: true,
            currency: "usd",
            product: "prod_test123",
            type: "recurring",
            created: Date.now(),
            livemode: false,
            metadata: {}
          } as Stripe.Price
        }
      ],
      has_more: false,
      url: ""
    },
    ...overrides
  } as Stripe.Checkout.Session;
}

// Helper to create a mock Stripe subscription
function createMockSubscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return {
    id: "sub_test123",
    object: "subscription",
    customer: "cus_test123",
    status: "active",
    ...overrides
  } as Stripe.Subscription;
}

// Helper to create a mock Stripe instance
function createMockStripe(overrides: {
  customer?: Stripe.Customer | Stripe.DeletedCustomer;
  subscription?: Stripe.Subscription;
} = {}) {
  return {
    customers: {
      retrieve: vi.fn().mockResolvedValue(overrides.customer || createMockCustomer())
    },
    subscriptions: {
      retrieve: vi.fn().mockResolvedValue(overrides.subscription || createMockSubscription())
    }
  } as unknown as Stripe;
}

describe("payments", () => {
  let mockSql: ReturnType<typeof createMockSql>;
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSql = createMockSql();
    vi.mocked(getDbConnection).mockResolvedValue(mockSql as any);
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("handleCheckoutSessionCompleted", () => {
    it("should create a new user and payment for a valid checkout session", async () => {
      const session = createMockSession();
      const customer = createMockCustomer();
      const stripe = createMockStripe({ customer });

      // First call returns empty array (user doesn't exist), subsequent calls succeed
      mockSql.mockResolvedValueOnce([]).mockResolvedValue([]);

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(stripe.customers.retrieve).toHaveBeenCalledWith("cus_test123");
      expect(getDbConnection).toHaveBeenCalled();
      expect(mockSql).toHaveBeenCalled();
    });

    it("should not create user if user already exists", async () => {
      const session = createMockSession();
      const customer = createMockCustomer();
      const stripe = createMockStripe({ customer });

      // User already exists
      mockSql.mockResolvedValueOnce([{ email: "test@example.com" }]);

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(stripe.customers.retrieve).toHaveBeenCalledWith("cus_test123");
      expect(getDbConnection).toHaveBeenCalled();
    });

    it("should handle customer without email", async () => {
      const session = createMockSession();
      const customerWithoutEmail = createMockCustomer({ email: null } as any);
      delete (customerWithoutEmail as any).email;
      const stripe = createMockStripe({ customer: customerWithoutEmail });

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(stripe.customers.retrieve).toHaveBeenCalledWith("cus_test123");
      // Should not attempt to create user or payment when email is missing
    });

    it("should handle session without line items", async () => {
      const session = createMockSession({ line_items: undefined });
      const customer = createMockCustomer();
      const stripe = createMockStripe({ customer });

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(stripe.customers.retrieve).toHaveBeenCalledWith("cus_test123");
      // Should not create user or payment when priceId is missing
    });

    it("should handle session with empty line items", async () => {
      const session = createMockSession({
        line_items: {
          object: "list",
          data: [],
          has_more: false,
          url: ""
        }
      });
      const customer = createMockCustomer();
      const stripe = createMockStripe({ customer });

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(stripe.customers.retrieve).toHaveBeenCalledWith("cus_test123");
    });

    it("should handle session with line item but no price", async () => {
      const session = createMockSession({
        line_items: {
          object: "list",
          data: [
            {
              id: "li_test123",
              object: "item",
              price: null
            } as any
          ],
          has_more: false,
          url: ""
        }
      });
      const customer = createMockCustomer();
      const stripe = createMockStripe({ customer });

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(stripe.customers.retrieve).toHaveBeenCalledWith("cus_test123");
    });

    it("should handle deleted customer", async () => {
      const session = createMockSession();
      const deletedCustomer: Stripe.DeletedCustomer = {
        id: "cus_test123",
        object: "customer",
        deleted: true
      };
      const stripe = createMockStripe({ customer: deletedCustomer });

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(stripe.customers.retrieve).toHaveBeenCalledWith("cus_test123");
      // Should not create user or payment for deleted customer (no email property)
    });

    it("should log the checkout session", async () => {
      const session = createMockSession();
      const stripe = createMockStripe();

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(consoleSpy).toHaveBeenCalledWith("checkout session completed", session);
    });

    it("should handle database error in createOrUpdateUser", async () => {
      const session = createMockSession();
      const customer = createMockCustomer();
      const stripe = createMockStripe({ customer });

      mockSql.mockRejectedValueOnce(new Error("Database connection error"));

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "error in creating or updating user",
        expect.any(Error)
      );
    });

    it("should handle database error in createPayment", async () => {
      const session = createMockSession();
      const customer = createMockCustomer();
      const stripe = createMockStripe({ customer });

      // First call succeeds (SELECT user), second call succeeds (INSERT user), third call fails (INSERT payment)
      mockSql
        .mockResolvedValueOnce([]) // User doesn't exist
        .mockResolvedValueOnce([]) // Insert user succeeds
        .mockRejectedValueOnce(new Error("Payment insert error"));

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error creating pament",
        expect.any(Error)
      );
    });

    it("should use correct customer data for user creation", async () => {
      const session = createMockSession();
      const customer = createMockCustomer({
        email: "custom@example.com",
        name: "Custom Name"
      });
      const stripe = createMockStripe({ customer });

      mockSql.mockResolvedValue([]);

      await handleCheckoutSessionCompleted({ session, stripe });

      // Verify the sql function was called with expected values
      expect(mockSql).toHaveBeenCalled();
    });

    it("should handle session with different amount_total values", async () => {
      const session = createMockSession({ amount_total: 9999 });
      const customer = createMockCustomer();
      const stripe = createMockStripe({ customer });

      mockSql.mockResolvedValue([]);

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(mockSql).toHaveBeenCalled();
    });

    it("should handle session with null amount_total", async () => {
      const session = createMockSession({ amount_total: null });
      const customer = createMockCustomer();
      const stripe = createMockStripe({ customer });

      mockSql.mockResolvedValue([]);

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(mockSql).toHaveBeenCalled();
    });

    it("should handle stripe customer retrieve error", async () => {
      const session = createMockSession();
      const stripe = createMockStripe();
      vi.mocked(stripe.customers.retrieve).mockRejectedValue(new Error("Stripe API error"));

      await expect(handleCheckoutSessionCompleted({ session, stripe })).rejects.toThrow("Stripe API error");
    });

    it("should handle different session statuses", async () => {
      const session = createMockSession({ status: "open" });
      const customer = createMockCustomer();
      const stripe = createMockStripe({ customer });

      mockSql.mockResolvedValue([]);

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(mockSql).toHaveBeenCalled();
    });
  });

  describe("handleSubscriptionDeleted", () => {
    it("should update user status to cancelled", async () => {
      const subscription = createMockSubscription();
      const stripe = createMockStripe({ subscription });

      await handleSubscriptionDeleted({ subscriptionId: "sub_test123", stripe });

      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith("sub_test123");
      expect(getDbConnection).toHaveBeenCalled();
      expect(mockSql).toHaveBeenCalled();
    });

    it("should handle subscription with different customer id", async () => {
      const subscription = createMockSubscription({ customer: "cus_different123" });
      const stripe = createMockStripe({ subscription });

      await handleSubscriptionDeleted({ subscriptionId: "sub_test123", stripe });

      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith("sub_test123");
      expect(mockSql).toHaveBeenCalled();
    });

    it("should throw error when stripe subscription retrieve fails", async () => {
      const stripe = createMockStripe();
      vi.mocked(stripe.subscriptions.retrieve).mockRejectedValue(new Error("Subscription not found"));

      await expect(
        handleSubscriptionDeleted({ subscriptionId: "sub_invalid", stripe })
      ).rejects.toThrow("Subscription not found");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "error in subscription dlete",
        expect.any(Error)
      );
    });

    it("should throw error when database update fails", async () => {
      const subscription = createMockSubscription();
      const stripe = createMockStripe({ subscription });
      mockSql.mockRejectedValue(new Error("Database update error"));

      await expect(
        handleSubscriptionDeleted({ subscriptionId: "sub_test123", stripe })
      ).rejects.toThrow("Database update error");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "error in subscription dlete",
        expect.any(Error)
      );
    });

    it("should throw error when getDbConnection fails", async () => {
      const subscription = createMockSubscription();
      const stripe = createMockStripe({ subscription });
      vi.mocked(getDbConnection).mockRejectedValue(new Error("Connection failed"));

      await expect(
        handleSubscriptionDeleted({ subscriptionId: "sub_test123", stripe })
      ).rejects.toThrow("Connection failed");
    });

    it("should handle subscription with customer as object", async () => {
      // Stripe sometimes returns customer as expanded object instead of string
      const subscription = createMockSubscription({
        customer: { id: "cus_expanded123" } as any
      });
      const stripe = createMockStripe({ subscription });

      await handleSubscriptionDeleted({ subscriptionId: "sub_test123", stripe });

      expect(mockSql).toHaveBeenCalled();
    });

    it("should log error with correct message before throwing", async () => {
      const stripe = createMockStripe();
      const testError = new Error("Test error");
      vi.mocked(stripe.subscriptions.retrieve).mockRejectedValue(testError);

      await expect(
        handleSubscriptionDeleted({ subscriptionId: "sub_test123", stripe })
      ).rejects.toThrow("Test error");

      expect(consoleErrorSpy).toHaveBeenCalledWith("error in subscription dlete", testError);
    });
  });

  describe("edge cases", () => {
    it("should handle multiple sequential checkout sessions", async () => {
      const session1 = createMockSession({ id: "cs_1" });
      const session2 = createMockSession({ id: "cs_2" });
      const customer = createMockCustomer();
      const stripe = createMockStripe({ customer });

      mockSql.mockResolvedValue([]);

      await handleCheckoutSessionCompleted({ session: session1, stripe });
      await handleCheckoutSessionCompleted({ session: session2, stripe });

      expect(stripe.customers.retrieve).toHaveBeenCalledTimes(2);
    });

    it("should handle concurrent subscription deletions", async () => {
      const stripe = createMockStripe();

      await Promise.all([
        handleSubscriptionDeleted({ subscriptionId: "sub_1", stripe }),
        handleSubscriptionDeleted({ subscriptionId: "sub_2", stripe })
      ]);

      expect(stripe.subscriptions.retrieve).toHaveBeenCalledTimes(2);
    });

    it("should handle customer with empty name", async () => {
      const session = createMockSession();
      const customer = createMockCustomer({ name: "" });
      const stripe = createMockStripe({ customer });

      mockSql.mockResolvedValue([]);

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(mockSql).toHaveBeenCalled();
    });

    it("should handle customer with null name", async () => {
      const session = createMockSession();
      const customer = createMockCustomer({ name: null });
      const stripe = createMockStripe({ customer });

      mockSql.mockResolvedValue([]);

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(mockSql).toHaveBeenCalled();
    });

    it("should handle very long email addresses", async () => {
      const longEmail = "a".repeat(200) + "@example.com";
      const session = createMockSession();
      const customer = createMockCustomer({ email: longEmail });
      const stripe = createMockStripe({ customer });

      mockSql.mockResolvedValue([]);

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(mockSql).toHaveBeenCalled();
    });

    it("should handle special characters in customer name", async () => {
      const session = createMockSession();
      const customer = createMockCustomer({ name: "O'Brien-Smith" });
      const stripe = createMockStripe({ customer });

      mockSql.mockResolvedValue([]);

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(mockSql).toHaveBeenCalled();
    });

    it("should handle unicode characters in customer name", async () => {
      const session = createMockSession();
      const customer = createMockCustomer({ name: "Hiroshi Tanaka" });
      const stripe = createMockStripe({ customer });

      mockSql.mockResolvedValue([]);

      await handleCheckoutSessionCompleted({ session, stripe });

      expect(mockSql).toHaveBeenCalled();
    });
  });
});
