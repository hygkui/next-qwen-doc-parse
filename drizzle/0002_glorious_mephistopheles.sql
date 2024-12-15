ALTER TABLE "documents" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "documents" RENAME COLUMN "hash" TO "file_hash";--> statement-breakpoint
ALTER TABLE "documents" RENAME COLUMN "corrected_content" TO "parsed_content";--> statement-breakpoint
ALTER TABLE "documents" DROP CONSTRAINT "documents_hash_unique";--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "original_content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "corrections" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN "changes";