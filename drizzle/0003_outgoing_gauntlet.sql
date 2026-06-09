ALTER TABLE "documents" ALTER COLUMN "b2_url" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "status" SET DEFAULT 'uploading';--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;