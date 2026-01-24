import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import type Stripe from "stripe";

// Use vi.hoisted to create mock functions that are available during module mocking
const {
  mockConstructEvent,
  mockSessionsRetrieve,
  mockHandleCheckoutSessionCompleted,
  mockHandleSubscriptionDeleted
} = vi.hoisted(() => ({
  mockConstructEvent: vi.fn(),
  mockSessionsRetrieve: vi.fn(),
  mockHandleCheckoutSessionCompleted: vi.fn(),
  mockHandleSubscriptionDeleted: vi.fn()
}));

// Mock the payments module
vi.mock("@/lib/payments", () => ({
  handleCheckoutSessionCompleted: mockHandleCheckoutSessionCompleted,
  handleSubscriptionDeleted: mockHandleSubscriptionDeleted
}));

// Mock Stripe with a class that can be constructed
vi.mock("stripe", () => {
  return {
    default: class MockStripe {
      webhooks = {
        constructEvent: mockConstructEvent
      };
      checkout = {
        sessions: {
          retrieve: mockSessionsRetrieve
        }
      };
    }
  };
});

import { POST } from "@/app/api/payments/route";

// Helper function to create mock NextRequest
function createMockRequest(payload: string, signature: string | null): NextRequest {
  return {
    text: vi.fn().mockResolvedValue(payload),
    headers: {
      get: vi.fn((name: string) => {
        if (name === "stripe-signature") return signature;
        return null;
      })
    }
  } as unknown as NextRequest;
}

describe("POST /api/payments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console mocks
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("checkout.session.completed event", () => {
    it("should handle checkout.session.completed successfully", async () => {
      const mockSessionId = "cs_test_123";
      const mockSession = {
        id: mockSessionId,
        customer: "cus_123",
        line_items: {
          data: [{ price: { id: "price_123" } }]
        }
      };

      const mockEvent: Partial<Stripe.Event> = {
        type: "checkout.session.completed",
        data: {
          object: { id: mockSessionId } as Stripe.Checkout.Session
        } as Stripe.Event.Data
      };

      mockConstructEvent.mockReturnValue(mockEvent);
      mockSessionsRetrieve.mockResolvedValue(mockSession);

      const req = createMockRequest('{"type":"checkout.session.completed"}', "valid_signature");
      const response = await POST(req);
      const responseData = await response.json();

      expect(mockConstructEvent).toHaveBeenCalled();
      expect(mockSessionsRetrieve).toHaveBeenCalledWith(mockSessionId, {
        expand: ["line_items"]
      });
      expect(mockHandleCheckoutSessionCompleted).toHaveBeenCalledWith({
        session: mockSession,
        stripe: expect.anything()
      });
      expect(response.status).toBe(200);
      expect(responseData).toEqual({ status: "Success" });
    });

    it("should retrieve session with line_items expanded", async () => {
      const mockSessionId = "cs_test_456";
      const mockSession = {
        id: mockSessionId,
        customer: "cus_456",
        line_items: {
          data: [{ price: { id: "price_456" } }]
        }
      };

      const mockEvent: Partial<Stripe.Event> = {
        type: "checkout.session.completed",
        data: {
          object: { id: mockSessionId } as Stripe.Checkout.Session
        } as Stripe.Event.Data
      };

      mockConstructEvent.mockReturnValue(mockEvent);
      mockSessionsRetrieve.mockResolvedValue(mockSession);

      const req = createMockRequest('{"type":"checkout.session.completed"}', "valid_signature");
      await POST(req);

      expect(mockSessionsRetrieve).toHaveBeenCalledWith(mockSessionId, {
        expand: ["line_items"]
      });
    });
  });

  describe("customer.subscription.deleted event", () => {
    it("should handle customer.subscription.deleted successfully", async () => {
      const mockSubscriptionId = "sub_test_789";
      const mockEvent: Partial<Stripe.Event> = {
        type: "customer.subscription.deleted",
        data: {
          object: { id: mockSubscriptionId } as Stripe.Subscription
        } as Stripe.Event.Data
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      const req = createMockRequest('{"type":"customer.subscription.deleted"}', "valid_signature");
      const response = await POST(req);
      const responseData = await response.json();

      expect(mockConstructEvent).toHaveBeenCalled();
      expect(mockHandleSubscriptionDeleted).toHaveBeenCalledWith({
        subscriptionId: mockSubscriptionId,
        stripe: expect.anything()
      });
      expect(response.status).toBe(200);
      expect(responseData).toEqual({ status: "Success" });
    });

    it("should pass the correct subscriptionId to handleSubscriptionDeleted", async () => {
      const mockSubscriptionId = "sub_specific_123";
      const mockEvent: Partial<Stripe.Event> = {
        type: "customer.subscription.deleted",
        data: {
          object: { id: mockSubscriptionId } as Stripe.Subscription
        } as Stripe.Event.Data
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      const req = createMockRequest('{"type":"customer.subscription.deleted"}', "valid_signature");
      await POST(req);

      expect(mockHandleSubscriptionDeleted).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriptionId: mockSubscriptionId
        })
      );
    });
  });

  describe("invalid signature error", () => {
    it("should return 400 error for invalid signature", async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const req = createMockRequest('{"type":"checkout.session.completed"}', "invalid_signature");
      const response = await POST(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: "Invalid Signature" });
    });

    it("should return 400 error when signature is missing", async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error("No stripe-signature header value was provided");
      });

      const req = createMockRequest('{"type":"checkout.session.completed"}', null);
      const response = await POST(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: "Invalid Signature" });
    });

    it("should log error when signature validation fails", async () => {
      const mockError = new Error("Signature verification failed");
      mockConstructEvent.mockImplementation(() => {
        throw mockError;
      });

      const req = createMockRequest('{"type":"checkout.session.completed"}', "bad_signature");
      await POST(req);

      expect(console.error).toHaveBeenCalledWith(mockError);
    });

    it("should not call handler functions when signature is invalid", async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const req = createMockRequest('{"type":"checkout.session.completed"}', "invalid_signature");
      await POST(req);

      expect(mockHandleCheckoutSessionCompleted).not.toHaveBeenCalled();
      expect(mockHandleSubscriptionDeleted).not.toHaveBeenCalled();
    });
  });

  describe("unknown event types", () => {
    it("should return success for unknown event types", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "payment_intent.succeeded" as Stripe.Event.Type,
        data: {
          object: { id: "pi_123" }
        } as Stripe.Event.Data
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      const req = createMockRequest('{"type":"payment_intent.succeeded"}', "valid_signature");
      const response = await POST(req);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({ status: "Success" });
    });

    it("should not call any handler for unknown event types", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "invoice.paid" as Stripe.Event.Type,
        data: {
          object: { id: "inv_123" }
        } as Stripe.Event.Data
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      const req = createMockRequest('{"type":"invoice.paid"}', "valid_signature");
      await POST(req);

      expect(mockHandleCheckoutSessionCompleted).not.toHaveBeenCalled();
      expect(mockHandleSubscriptionDeleted).not.toHaveBeenCalled();
    });

    it("should log event type for unknown events", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "charge.succeeded" as Stripe.Event.Type,
        data: {
          object: { id: "ch_123" }
        } as Stripe.Event.Data
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      const req = createMockRequest('{"type":"charge.succeeded"}', "valid_signature");
      await POST(req);

      expect(console.log).toHaveBeenCalledWith("charge.succeeded");
    });
  });

  describe("error handling during handler execution", () => {
    it("should return 400 when handleCheckoutSessionCompleted throws", async () => {
      const mockSessionId = "cs_test_error";
      const mockSession = {
        id: mockSessionId,
        customer: "cus_error"
      };

      const mockEvent: Partial<Stripe.Event> = {
        type: "checkout.session.completed",
        data: {
          object: { id: mockSessionId } as Stripe.Checkout.Session
        } as Stripe.Event.Data
      };

      mockConstructEvent.mockReturnValue(mockEvent);
      mockSessionsRetrieve.mockResolvedValue(mockSession);
      mockHandleCheckoutSessionCompleted.mockRejectedValue(new Error("Database error"));

      const req = createMockRequest('{"type":"checkout.session.completed"}', "valid_signature");
      const response = await POST(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: "Invalid Signature" });
    });

    it("should return 400 when handleSubscriptionDeleted throws", async () => {
      const mockSubscriptionId = "sub_test_error";
      const mockEvent: Partial<Stripe.Event> = {
        type: "customer.subscription.deleted",
        data: {
          object: { id: mockSubscriptionId } as Stripe.Subscription
        } as Stripe.Event.Data
      };

      mockConstructEvent.mockReturnValue(mockEvent);
      mockHandleSubscriptionDeleted.mockRejectedValue(new Error("Database error"));

      const req = createMockRequest('{"type":"customer.subscription.deleted"}', "valid_signature");
      const response = await POST(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: "Invalid Signature" });
    });

    it("should return 400 when session retrieval fails", async () => {
      const mockSessionId = "cs_test_retrieval_fail";
      const mockEvent: Partial<Stripe.Event> = {
        type: "checkout.session.completed",
        data: {
          object: { id: mockSessionId } as Stripe.Checkout.Session
        } as Stripe.Event.Data
      };

      mockConstructEvent.mockReturnValue(mockEvent);
      mockSessionsRetrieve.mockRejectedValue(new Error("Stripe API error"));

      const req = createMockRequest('{"type":"checkout.session.completed"}', "valid_signature");
      const response = await POST(req);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: "Invalid Signature" });
    });
  });

  describe("request parsing", () => {
    it("should read payload from request body", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "invoice.created" as Stripe.Event.Type,
        data: {
          object: { id: "inv_123" }
        } as Stripe.Event.Data
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      const payload = '{"type":"invoice.created","data":{"object":{"id":"inv_123"}}}';
      const req = createMockRequest(payload, "valid_signature");
      await POST(req);

      expect(req.text).toHaveBeenCalled();
    });

    it("should get stripe-signature header from request", async () => {
      const mockEvent: Partial<Stripe.Event> = {
        type: "invoice.created" as Stripe.Event.Type,
        data: {
          object: { id: "inv_123" }
        } as Stripe.Event.Data
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      const signature = "t=123,v1=abc";
      const req = createMockRequest('{}', signature);
      await POST(req);

      expect(req.headers.get).toHaveBeenCalledWith("stripe-signature");
    });
  });
});
