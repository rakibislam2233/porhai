DROP TABLE "chunks" CASCADE;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "file_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "b2_key";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "b2_url";--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "page_count";