import "@testing-library/jest-dom";

// Mock environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.OPENAI_API_KEY = "test-openai-key";
process.env.STRIPE_SECRET_KEY = "test-stripe-key";
process.env.STRIPE_WEBHOOK_SECRET = "test-webhook-secret";
