ALTER TABLE `photos` ADD `sort_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
WITH ranked AS (
 SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC, id ASC) - 1 AS position FROM photos
)
UPDATE photos SET sort_order = (SELECT position FROM ranked WHERE ranked.id = photos.id);
