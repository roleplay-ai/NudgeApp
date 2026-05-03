-- ============================================
-- apply_videos RLS (fixes: new row violates row-level security policy)
-- Run in Supabase → SQL Editor.
-- Requires public.is_admin() (profiles.role = 'admin' for auth.uid()).
-- ============================================

ALTER TABLE public.apply_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads apply videos" ON public.apply_videos;
DROP POLICY IF EXISTS "admin writes apply videos" ON public.apply_videos;

-- App users read published clips via anon/authenticated server client
CREATE POLICY "anyone reads apply videos"
ON public.apply_videos FOR SELECT
USING (true);

-- Admins manage rows (INSERT needs WITH CHECK — USING alone is not enough on all Postgres versions)
CREATE POLICY "admin writes apply videos"
ON public.apply_videos FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
