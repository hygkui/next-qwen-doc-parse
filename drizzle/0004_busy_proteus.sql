ALTER TABLE "knowledges" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "knowledges" ADD COLUMN "type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "knowledges" ADD COLUMN "tags" text[];