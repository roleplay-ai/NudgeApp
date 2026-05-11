-- ============================================
-- Analytics: store authenticated user ID
-- Run in Supabase → SQL Editor.
-- ============================================

ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx
  ON public.analytics_events (user_id);
