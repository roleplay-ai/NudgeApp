-- Optional grouping + card pill for Apply video grid (matches user Apply UI filters / category tags).
ALTER TABLE public.apply_videos ADD COLUMN IF NOT EXISTS group_name text DEFAULT 'Features';
UPDATE public.apply_videos SET group_name = 'Features' WHERE group_name IS NULL;
ALTER TABLE public.apply_videos ADD COLUMN IF NOT EXISTS category_tag text;

COMMENT ON COLUMN public.apply_videos.group_name IS 'One of: Features, Apps, Workflows, Skills — for Apply page filter chips';
COMMENT ON COLUMN public.apply_videos.category_tag IS 'Small pill on card, e.g. EDITING, KNOWLEDGE';
