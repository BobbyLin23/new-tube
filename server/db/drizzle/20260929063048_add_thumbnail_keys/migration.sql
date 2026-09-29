CREATE TYPE "video_visibility" AS ENUM('private', 'public');--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "thumbnail_key" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "preview_key" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "visibility" "video_visibility" DEFAULT 'private'::"video_visibility" NOT NULL;