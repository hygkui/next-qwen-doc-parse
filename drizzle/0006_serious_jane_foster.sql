CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text,
	"user_id" uuid,
	"model" text DEFAULT 'qwen-72b',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"messages" jsonb DEFAULT '[]'::jsonb
);
