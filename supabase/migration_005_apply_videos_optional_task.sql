-- Apply videos can exist without a parent apply_tasks row (video-only Apply section).
-- Run in Supabase SQL Editor if apply_videos.task_id is still NOT NULL.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'apply_videos'
      AND column_name = 'task_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.apply_videos ALTER COLUMN task_id DROP NOT NULL;
  END IF;
END $$;
