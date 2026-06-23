ALTER TABLE "ai_assessments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "ai_assessments" CASCADE;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "slot" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "slot" SET DEFAULT 'shop'::text;--> statement-breakpoint
DROP TYPE "public"."booking_slot";--> statement-breakpoint
CREATE TYPE "public"."booking_slot" AS ENUM('shop', 'island', 'kamloops');--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "slot" SET DEFAULT 'shop'::"public"."booking_slot";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "slot" SET DATA TYPE "public"."booking_slot" USING "slot"::"public"."booking_slot";--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "pst" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
CREATE INDEX "customers_archived_at_idx" ON "customers" USING btree ("archived_at");--> statement-breakpoint
DROP TYPE "public"."ai_assessment_status";