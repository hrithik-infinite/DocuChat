ALTER TABLE "pdf_summaries" ADD COLUMN "word_count" integer;--> statement-breakpoint
ALTER TABLE "pdf_summaries" ADD COLUMN "template" varchar(50) DEFAULT 'detailed';