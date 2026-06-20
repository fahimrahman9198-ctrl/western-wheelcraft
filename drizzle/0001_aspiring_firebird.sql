ALTER TYPE "public"."communication_direction" ADD VALUE 'internal';--> statement-breakpoint
ALTER TYPE "public"."quote_status" ADD VALUE 'contacted' BEFORE 'sent';--> statement-breakpoint
ALTER TYPE "public"."quote_status" ADD VALUE 'quoted' BEFORE 'sent';--> statement-breakpoint
ALTER TYPE "public"."quote_status" ADD VALUE 'booked' BEFORE 'declined';--> statement-breakpoint
ALTER TYPE "public"."quote_status" ADD VALUE 'completed' BEFORE 'declined';--> statement-breakpoint
ALTER TYPE "public"."quote_status" ADD VALUE 'cancelled' BEFORE 'expired';--> statement-breakpoint
CREATE TABLE "admin_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_clerk_user_id" varchar(255) NOT NULL,
	"admin_username" varchar(160) NOT NULL,
	"admin_role" varchar(40) NOT NULL,
	"action" varchar(80) NOT NULL,
	"entity_type" varchar(40) NOT NULL,
	"entity_id" uuid NOT NULL,
	"summary" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "admin_activities_entity_idx" ON "admin_activities" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "admin_activities_admin_idx" ON "admin_activities" USING btree ("admin_clerk_user_id");