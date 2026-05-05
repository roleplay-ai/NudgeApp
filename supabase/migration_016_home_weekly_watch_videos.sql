-- ============================================
-- Home: "Watch this week" (4 picks) — admin-controlled
-- Run in Supabase → SQL Editor.
-- Requires public.is_admin() (profiles.role = 'admin' for auth.uid()).
-- ============================================

CREATE TABLE IF NOT EXISTS public.home_weekly_watch_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot int NOT NULL CHECK (slot >= 1 AND slot <= 4),
  watch_video_id uuid NOT NULL REFERENCES public.watch_videos(id) ON DELETE CASCADE,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slot),
  UNIQUE (watch_video_id)
);

ALTER TABLE public.home_weekly_watch_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads home weekly watch videos" ON public.home_weekly_watch_videos;
DROP POLICY IF EXISTS "admin writes home weekly watch videos" ON public.home_weekly_watch_videos;

CREATE POLICY "anyone reads home weekly watch videos"
ON public.home_weekly_watch_videos FOR SELECT
USING (true);

CREATE POLICY "admin writes home weekly watch videos"
ON public.home_weekly_watch_videos FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

