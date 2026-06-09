ALTER TABLE "documents" ALTER COLUMN "status" SET DATA TYPE "public"."status";--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "status" SET DEFAULT 'pending';