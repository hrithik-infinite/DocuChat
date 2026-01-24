import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("constants", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.resetModules();
  });

  it("should export plans array with correct structure", async () => {
    const { plans } = await import("@/utils/contants");
    expect(plans).toBeInstanceOf(Array);
    expect(plans.length).toBe(2);
  });

  it("should have basic plan", async () => {
    const { plans } = await import("@/utils/contants");
    const basicPlan = plans.find((p) => p.id === "basic");
    expect(basicPlan).toBeDefined();
    expect(basicPlan?.name).toBe("Free");
    expect(basicPlan?.price).toBe(0);
    expect(basicPlan?.priceId).toBe("free");
  });

  it("should have pro plan", async () => {
    const { plans } = await import("@/utils/contants");
    const proPlan = plans.find((p) => p.id === "pro");
    expect(proPlan).toBeDefined();
    expect(proPlan?.name).toBe("Pro");
    expect(proPlan?.price).toBe(299);
  });

  it("should export PricingType type", async () => {
    const constants = await import("@/utils/contants");
    expect(constants.plans).toBeDefined();
  });

  it("should have items array in plans", async () => {
    const { plans } = await import("@/utils/contants");
    plans.forEach((plan) => {
      expect(plan.items).toBeInstanceOf(Array);
      expect(plan.items.length).toBeGreaterThan(0);
    });
  });

  it("should have valid payment links", async () => {
    const { plans } = await import("@/utils/contants");
    plans.forEach((plan) => {
      expect(typeof plan.paymentLink).toBe("string");
      expect(plan.paymentLink.length).toBeGreaterThan(0);
    });
  });
});

describe("ORIGIN_URL", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("should return production URL when not in development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { ORIGIN_URL } = await import("@/utils/contants");
    expect(ORIGIN_URL).toBe("https://docuchat-hrithik.vercel.app");
  });
});
