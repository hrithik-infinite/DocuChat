import { pgTable, uuid, varchar, text, timestamp, integer, serial } from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  fullName: varchar("full_name", { length: 255 }),
  customerId: varchar("customer_id", { length: 255 }).unique(),
  priceId: varchar("price_id", { length: 255 }),
  status: varchar("status", { length: 50 }).default("inactive"),
});

// PDF Summaries table
export const pdfSummaries = pgTable("pdf_summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  originalFileUrl: text("original_file_url").notNull(),
  summaryText: text("summary_text").notNull(),
  status: varchar("status", { length: 50 }).default("completed"),
  title: text("title"),
  fileName: text("file_name"),
  originalText: text("original_text"),
  wordCount: integer("word_count"),
  template: varchar("template", { length: 50 }).default("detailed"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }).notNull().unique(),
  priceId: varchar("price_id", { length: 255 }).notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull().references(() => users.email),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Document chunks for RAG
export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  summaryId: uuid("summary_id").notNull().references(() => pdfSummaries.id, { onDelete: "cascade" }),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  startChar: integer("start_char"),
  endChar: integer("end_char"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Migrations tracking table
export const migrations = pgTable("_migrations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  executedAt: timestamp("executed_at", { withTimezone: true }).defaultNow(),
});

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type PdfSummary = typeof pdfSummaries.$inferSelect;
export type NewPdfSummary = typeof pdfSummaries.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type DocumentChunk = typeof documentChunks.$inferSelect;
export type NewDocumentChunk = typeof documentChunks.$inferInsert;
