ALTER TABLE "page_tags" DROP CONSTRAINT "page_tags_page_id_pages_id_fk";
--> statement-breakpoint
ALTER TABLE "page_tags" DROP CONSTRAINT "page_tags_tag_id_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "pages" DROP CONSTRAINT "pages_parent_id_pages_id_fk";
--> statement-breakpoint
ALTER TABLE "pages" ALTER COLUMN "content" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "color" SET DEFAULT '#6B7280';--> statement-breakpoint
ALTER TABLE "page_tags" ADD CONSTRAINT "page_tags_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_tags" ADD CONSTRAINT "page_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE no action ON UPDATE no action;