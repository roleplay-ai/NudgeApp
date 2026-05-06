-- ============================================
-- Add `brief` column to news_items
-- A short 1-2 sentence teaser shown on the black hero card on Home.
-- Run in Supabase → SQL Editor.
-- ============================================

ALTER TABLE public.news_items
  ADD COLUMN IF NOT EXISTS brief text;
