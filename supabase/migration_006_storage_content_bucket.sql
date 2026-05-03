-- ============================================
-- Storage bucket `content` (images + videos)
-- Fixes: "Bucket not found" when uploading in admin.
-- Run once in Supabase → SQL Editor.
-- Requires public.is_admin() (see schema / profiles.role).
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;

-- Replace policies so uploads work for admins (safe to re-run)
DROP POLICY IF EXISTS "anyone reads content images" ON storage.objects;
DROP POLICY IF EXISTS "admin uploads content images" ON storage.objects;
DROP POLICY IF EXISTS "admin updates content images" ON storage.objects;
DROP POLICY IF EXISTS "admin deletes content images" ON storage.objects;

CREATE POLICY "anyone reads content images"
ON storage.objects FOR SELECT
USING (bucket_id = 'content');

CREATE POLICY "admin uploads content images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'content' AND public.is_admin());

CREATE POLICY "admin updates content images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'content' AND public.is_admin());

CREATE POLICY "admin deletes content images"
ON storage.objects FOR DELETE
USING (bucket_id = 'content' AND public.is_admin());
