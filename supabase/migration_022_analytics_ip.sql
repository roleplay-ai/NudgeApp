-- ============================================
-- Analytics: store request IP address
-- Run in Supabase → SQL Editor.
-- ============================================

ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS ip_address text;

