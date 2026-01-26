CREATE TABLE "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"summary_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"start_char" integer,
	"end_char" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "_migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"executed_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "_migrations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"stripe_payment_id" varchar(255) NOT NULL,
	"price_id" varchar(255) NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "payments_stripe_payment_id_unique" UNIQUE("stripe_payment_id")
);
--> statement-breakpoint
CREATE TABLE "pdf_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"original_file_url" text NOT NULL,
	"summary_text" text NOT NULL,
	"status" varchar(50) DEFAULT 'completed',
	"title" text,
	"file_name" text,
	"original_text" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"full_name" varchar(255),
	"customer_id" varchar(255),
	"price_id" varchar(255),
	"status" varchar(50) DEFAULT 'inactive',
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_summary_id_pdf_summaries_id_fk" FOREIGN KEY ("summary_id") REFERENCES "public"."pdf_summaries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;