CREATE TYPE "public"."email_automation_kind" AS ENUM('quote_follow_up', 'booking_reminder', 'missed_booking', 'post_service_review', 'post_service_care', 'post_service_referral', 'lost_quote_reactivation', 'seasonal_reminder');--> statement-breakpoint
CREATE TYPE "public"."email_automation_status" AS ENUM('scheduled', 'sent', 'skipped', 'failed', 'cancelled');--> statement-breakpoint
CREATE TABLE "email_automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"related_type" varchar(40) NOT NULL,
	"related_id" uuid NOT NULL,
	"kind" "email_automation_kind" NOT NULL,
	"sequence_step" integer DEFAULT 1 NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"status" "email_automation_status" DEFAULT 'scheduled' NOT NULL,
	"subject" varchar(255),
	"body" text,
	"provider_message_id" varchar(255),
	"last_error" text,
	"metadata" jsonb,
	"sent_at" timestamp with time zone,
	"skipped_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "communications" ADD COLUMN "provider_status" varchar(80);--> statement-breakpoint
ALTER TABLE "communications" ADD COLUMN "provider_event_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "communications" ADD COLUMN "provider_error" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "email_opt_out_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "email_opt_out_reason" varchar(255);--> statement-breakpoint
ALTER TABLE "email_automations" ADD CONSTRAINT "email_automations_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_automations_related_step_idx" ON "email_automations" USING btree ("related_type","related_id","kind","sequence_step");--> statement-breakpoint
CREATE INDEX "email_automations_due_idx" ON "email_automations" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "email_automations_related_idx" ON "email_automations" USING btree ("related_type","related_id");--> statement-breakpoint
CREATE INDEX "email_automations_kind_idx" ON "email_automations" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "email_automations_customer_id_idx" ON "email_automations" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "email_automations_provider_message_id_idx" ON "email_automations" USING btree ("provider_message_id");--> statement-breakpoint
CREATE INDEX "communications_provider_message_id_idx" ON "communications" USING btree ("provider_message_id");