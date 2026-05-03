-- ============================================
-- Create public.apply_videos (fixes: table not found in schema cache)
-- Run once in Supabase → SQL Editor.
-- Also applies RLS policies (needs public.is_admin()).
-- ============================================

CREATE TABLE IF NOT EXISTS public.apply_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration text,
  order_index int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.apply_videos IS 'Apply tab walkthrough clips (Supabase Storage URLs); task_id optional legacy link';

CREATE INDEX IF NOT EXISTS apply_videos_order_idx ON public.apply_videos (order_index);

-- Nullable task_id for video-only Apply flow (safe if apply_tasks table does not exist)
ALTER TABLE public.apply_videos ALTER COLUMN task_id DROP NOT NULL;

ALTER TABLE public.apply_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads apply videos" ON public.apply_videos;
DROP POLICY IF EXISTS "admin writes apply videos" ON public.apply_videos;

CREATE POLICY "anyone reads apply videos"
ON public.apply_videos FOR SELECT
USING (true);

CREATE POLICY "admin writes apply videos"
ON public.apply_videos FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
