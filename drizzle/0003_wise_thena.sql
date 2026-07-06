CREATE TYPE "public"."quote_follow_up_status" AS ENUM('scheduled', 'sent', 'skipped', 'failed');--> statement-breakpoint
CREATE TABLE "quote_follow_ups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"customer_id" uuid,
	"sequence_step" integer NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"status" "quote_follow_up_status" DEFAULT 'scheduled' NOT NULL,
	"subject" varchar(255),
	"body" text,
	"provider_message_id" varchar(255),
	"last_error" text,
	"sent_at" timestamp with time zone,
	"skipped_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote_follow_ups" ADD CONSTRAINT "quote_follow_ups_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_follow_ups" ADD CONSTRAINT "quote_follow_ups_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quote_follow_ups_quote_step_idx" ON "quote_follow_ups" USING btree ("quote_id","sequence_step");--> statement-breakpoint
CREATE INDEX "quote_follow_ups_due_idx" ON "quote_follow_ups" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "quote_follow_ups_quote_id_idx" ON "quote_follow_ups" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quote_follow_ups_customer_id_idx" ON "quote_follow_ups" USING btree ("customer_id");